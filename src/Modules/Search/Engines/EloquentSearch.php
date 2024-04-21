<?php

declare(strict_types=1);

namespace App\Modules\Search\Engines;

use App\Modules\Search\LemmetizationInterface;
use App\Modules\Search\SearchableInterface;
use App\Modules\Search\SearchEngineInterface;
use App\Modules\Search\SearchResult;
use Illuminate\Database\Connection;
use Illuminate\Support\Collection;

class EloquentSearch implements SearchEngineInterface
{
    public function __construct(
        protected Connection $db,
        protected LemmetizationInterface $lemmetization,
        protected ?int $moodleId = null
    ) {
    }

    /**
     * @param int $moodleId
     * @return EloquentSearch
     */
    public function withMoodleId(int $moodleId): static
    {
        return new static($this->db, $this->lemmetization, $moodleId);
    }

    /**
     * @inheritDoc
     */
    public function search(string $query, int $limit = 10): array
    {
        $searchWords = explode(" ", trim($query));
        $documentKeywordFrequency = $this->getKeywords($searchWords);

        if(count($documentKeywordFrequency) > 5) {
            throw new \Exception("Too many words. Max: 5.", 400);
        }

        if ($this->moodleId === null) {
            throw new \Exception("No user moodle id is set");
        }
        $userCourses = $this->db
            ->table("user_course_assign")
            ->where("moodle_id", $this->moodleId)
            ->get()
            ->keyBy('course_id');

        $keywordSearchItems = $this
            ->getKeywordSearchItemsByKeywords(
                array_keys($documentKeywordFrequency)
            );

        $occuranceOfWordInDocuments = [];
        $keywordSearchItemsById = $keywordSearchItems->groupBy('search_item_id');

        $searchItems = $this->getSearchItemsByIds($keywordSearchItemsById->keys());
        $searchItems = $searchItems->filter(function (object $searchItem) use ($userCourses) {
            return $searchItem->moodle_id === $this->moodleId
                || isset($userCourses[$searchItem->course_id]);
        });

        $keywordSearchItemsById = $keywordSearchItemsById->filter(function (object $value, string $key) use ($searchItems) {
            return isset($searchItems[$key]);
        });

        $keywordSearchItemsByIdTemp = $keywordSearchItemsById;
        $keywordSearchItemsById = new Collection();
        foreach ($keywordSearchItemsByIdTemp as $keywordSearchItem) {
            $keywordSearchItemsById->add($keywordSearchItem[0]);
        }

        foreach($keywordSearchItemsById->groupBy('keyword') as $keyword => $docs) {
            $occuranceOfWordInDocuments[$keyword] = count($docs);
        }

        $_docCount = count($keywordSearchItemsById->groupBy('search_item_id'));

        if(!(bool)count($searchItems) || !(bool)$_docCount) {
            return [];
        }

        $result = [];

        foreach ($keywordSearchItemsById->groupBy('search_item_id') as $itemId => $keywordSearchItems) {
            $searchItem = $searchItems[$itemId];
            foreach ($keywordSearchItems as $keywordSearchItem) {

                $keywordSearchItem->_tf = $this->tf((float) $searchItem->word_count, (float) $keywordSearchItem->occurences);
                $keywordSearchItem->_idf = $this->idf($_docCount, $occuranceOfWordInDocuments[$keywordSearchItem->keyword]);
            }

            $documentVector = $keywordSearchItems->map(function ($item) {
                return $item->_tf * $item->_idf;
            });

            $_document_vector_sum = $documentVector->sum();

            $result[$itemId] = [
                'search_item' => $searchItem,
                'tf_idf_vector' => $documentVector->toArray(),
                'document_vector_sum' => $_document_vector_sum
            ];
        }
        $queryVector = collect($searchWords)->map(function ($word) use ($_docCount, $occuranceOfWordInDocuments, $searchWords) {
            $tf = $this->tf(count($searchWords), 1);
            $idf = $this->idf($_docCount, $occuranceOfWordInDocuments[$word] ?? 0);
            return $tf * $idf;
        });

        $_query_vector_sum = $queryVector->sum();

        foreach ($result as $itemId => &$item) {
            $cosineSimilarity = $this->cosineSimilarity($queryVector, collect($item['tf_idf_vector']), $_query_vector_sum, $item['document_vector_sum']);
            $item['score'] = $cosineSimilarity;
        }

        usort($result, function ($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        $res = array_slice($result, 0, $limit);

        return array_map(function (array $searchElem): SearchResult {
            return new SearchResult(
                idValue: $searchElem['search_item']->id_value,
                idColunm: $searchElem['search_item']->id_column,
                score: $searchElem['score'],
                type: $searchElem['search_item']->type,
            );
        }, $res);
    }

    protected function tf(int|float $wordCount, int|float $wordInDocument): int|float
    {
        return $wordCount / $wordInDocument;
    }

    protected function idf(int|float $docCount, int|float $docsWithWord): int|float
    {
        if($docsWithWord === 0) {
            $docsWithWord = 1;
        }
        return 1 + log($docCount / $docsWithWord);
    }

    /**
     * @param Collection $vec1
     * @param Collection $vec2
     * @param int|float $sum1
     * @param int|float $sum2
     * @return float|int
     */
    protected function cosineSimilarity(Collection $vec1, Collection $vec2, int|float $sum1, int|float $sum2)
    {
        $dotProduct = $vec1->zip($vec2)->map(function ($pair) {
            return $pair[0] * $pair[1];
        })->sum();

        $magnitude1 = sqrt($sum1);
        $magnitude2 = sqrt($sum2);

        if ($magnitude1 == 0 || $magnitude2 == 0) {
            return 0;
        }

        return $dotProduct / ($magnitude1 * $magnitude2);
    }

    /**
     * @param Collection $searchItemIds
     * @return Collection<object>
     */
    protected function getSearchItemsByIds(Collection $searchItemIds): Collection
    {
        return $this
            ->db
            ->table('search_items')
            ->whereIn('item_id', $searchItemIds)
            ->get()
            ->keyBy('item_id');
    }

    /**
     * @param array $keyWords
     * @return \Illuminate\Support\Collection<object>
     */
    protected function getKeywordSearchItemsByKeywords(array $keyWords): Collection
    {
        $keyWords = array_map(fn (int|string|float $word) => (string) $word, $keyWords);
        return $this
            ->db
            ->table('search_item_keywords')
            ->whereIn("keyword", $keyWords)
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function putMany(array $searchItems): void
    {
        $searchablesUpsert = [];
        $searchItemKeywordUpsert = [];
        $allKeywords = [];

        foreach($searchItems as $searchable) {
            $searchableWords = $searchable->getWords();
            $keywords = $this->getKeywords($searchableWords);
            $allKeywords = array_merge($allKeywords, $keywords);

            $searchablesUpsert[] = $this->getSearchItemInsertArray($searchable, $searchableWords);

            foreach($keywords as $keyword => $count) {
                $searchItemKeywordUpsert[] = [
                    'keyword' => $keyword,
                    'occurences' => $count,
                    'search_item_id' => $searchable->getUniqueIdentifier()
                ];
            }
        }

        $allkwords = array_keys($allKeywords);

        $keywordsUpsert = array_map(
            function (string $keyword): array {
                return [
                    'word' => $keyword
                ];
            },
            array_merge(
                array_diff(array_map(fn (array $da) => $da['keyword'], $searchItemKeywordUpsert), $allkwords),
                $allkwords
            )
        );


        $this->performPut($searchablesUpsert, $keywordsUpsert, $searchItemKeywordUpsert);
    }

    /**
     * @inheritDoc
     */
    public function put(SearchableInterface $searchable): void
    {
        $searchableWords = $searchable->getWords();
        $keywords = $this->getKeywords($searchableWords);

        $searchableUpsert = $this->getSearchItemInsertArray($searchable, $searchableWords);
        $searchItemKeywordUpsert = [];
        $keywordsUpsert = [];

        foreach($keywords as $keyword => $count) {
            $keywordsUpsert[] = [
                'word' => $keyword
            ];

            $searchItemKeywordUpsert[] = [
                'keyword' => $keyword,
                'occurences' => $count,
                'search_item_id' => $searchableUpsert['item_id']
            ];
        }

        $this->performPut($searchableUpsert, $keywordsUpsert, $searchItemKeywordUpsert);
    }

    /**
     * @param array<string int|string> $searchableUpsert
     * @param array<string int|string> $keywordsUpsert
     * @param array<string int|string> $searchItemKeywordUpsert
     * @return void
     */
    protected function performPut(array $searchableUpsert, array $keywordsUpsert, array $searchItemKeywordUpsert): void
    {
        $db = $this->db;
        $db->beginTransaction();
        try {
            $db->table('search_items')->upsert(
                $searchableUpsert,
                ['item_id'],
                ['word_count']
            );

            $db->table('keywords')->upsert(
                $keywordsUpsert,
                ['word']
            );

            $db->table('search_item_keywords')->upsert(
                $searchItemKeywordUpsert,
                ['search_item_id', 'keyword'],
                ['occurences']
            );

        } catch (\Throwable $th) {
            $db->rollBack();
            throw $th;
        }

        $db->commit();
    }

    /**
     * Summary of getSearchItemInsertArray
     * @param \App\Modules\Search\SearchableInterface $searchable
     * @param null|string[] $words
     * @return array{item_id: string, id_column: string, id_value: string, words_count: int}
     */
    protected function getSearchItemInsertArray(SearchableInterface $searchable, ?array $words = null)
    {
        $words = $words ?? $searchable->getWords();
        $wordsCount = count($words);

        return [
            'item_id' => $searchable->getUniqueIdentifier(),
            'id_column' => $searchable->getIdColumn(),
            'id_value' => $searchable->getIdValue(),
            'word_count' => $wordsCount,
            'type' => $searchable->getType(),
            'moodle_id' => $searchable->getMoodleId(),
            'course_id' => $searchable->getCourseId()
        ];
    }

    /**
     * @param string[]
     * @return array<string, int>
     */
    protected function getKeywords(array $words): array
    {
        $keyWords = [];
        foreach($words as $word) {
            $keyWord = $this->lemmetization->get($word) ?? $word;

            if($keyWord === "") {
                continue;
            }

            if(!isset($keyWords[$keyWord])) {
                $keyWords[$keyWord] = 0;
            }
            $keyWords[$keyWord]++;
        }
        return $keyWords;
    }
}
