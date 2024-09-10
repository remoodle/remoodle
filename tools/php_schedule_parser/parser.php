<?php

declare(strict_types=1);
use Smalot\PdfParser\Parser;

require_once __DIR__ . '/vendor/autoload.php';

const FILE_PATH = __DIR__ . '/sc.pdf';
const WEEK_DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];
const LESSON_TYPE_PRACTICE = 'practice';
const LESSON_TYPE_LECTURE = 'lecture';

function extractDataFromString(string $data): array
{
    $dataArr = explode(' ', $data);

    $stopCourseName = false;
    $stopCabinet = true;
    $stopPrepod = true;

    $courseName = [];
    $cabinet = [];
    $isOnline = false;
    $prepod = [];
    $type = null;

    foreach($dataArr as $key => $dataStr) {
        if($key === 0 || $key === 1) {
            $courseName[] = $dataStr;
            continue;
        }

        if(($dataStr[0] === 'C' && $dataStr[1] === '1') || ($dataStr === 'gym') || ($dataStr === 'online') || (str_contains($dataStr, 'IEC-'))) {
            if($dataStr === 'online') {
                $isOnline = true;
            }
            $stopCabinet = false;
            $stopCourseName = true;
        }

        if($dataStr === 'lecture' || $dataStr === 'practice') {
            $type = $dataStr;
            $stopCabinet = true;
            $stopPrepod = false;
            continue;
        }

        if($stopCourseName === false) {
            $courseName[] = $dataStr;
        }

        if($stopCabinet === false) {
            $cabinet[] = $dataStr;
        }

        if($stopPrepod === false) {
            $prepod[] = $dataStr;
        }
    }

    return [
        'courseName' => implode(' ', $courseName),
        'cabinet' => implode(' ', $cabinet),
        'teacher' => implode(' ', $prepod),
        'isOnline' => $isOnline,
        'type' => $type
    ];
}

function extractTime(string $line): string|false
{
    if(strlen($line) < 12) {
        return false;
    }
    if(is_numeric($line[0]) && is_numeric($line[1])
        && ($line[2] === ':')
        && is_numeric($line[3]) && is_numeric($line[4])
        && ($line[5] === '-')
        && is_numeric($line[6]) && is_numeric($line[7])
        && ($line[8] === ':')
        && is_numeric($line[9]) && is_numeric($line[10])
    ) {
        return substr($line, 0, 11);
    }

    return false;
}

$parser = new Parser();
$pdf = $parser->parseFile(FILE_PATH);
$text = $pdf->getText();
$lines = explode("\n", $text);

$flatSchedule = [];
$currentGroup = null;
$currentWeekDay = null;
$prevIndex = null;
$prevSeq = false;

for ($i = 0; $i < count($lines); $i++) {
    $line = trim(preg_replace('/[ ]{2,}|[\t]/', ' ', $lines[$i]));
    
    if (strlen($line) < 1) {
        continue;
    }

    if (str_contains($line, "Group ")) {
        $currentGroup = explode(" ", $line)[1];
        $currentWeekDay = null;
        $prevIndex = null;
        continue;
    }

    foreach (WEEK_DAYS as $weekDay) {
        if (str_contains($line, $weekDay) && count(explode(" ", $line)) === 1) {
            $currentWeekDay = $weekDay;
            continue 2;
        }
    }

    if ($currentWeekDay === null || $currentGroup === null) {
        continue;
    }

    $index = extractTime($line);
    if ($index === false && $prevIndex === null) {
        continue;
    }

    if ($index === false && $prevIndex !== null) {
        $elemsL = [
            'time' => $prevIndex,
            'items' => []
        ];
        $localI = $i;
        $cc = 0;
        while ($localI < count($lines) && extractTime($lines[$localI]) === false) {
            $localLine = trim(preg_replace('/[ ]{2,}|[\t]/', ' ', $lines[$localI]));
            if (strlen($localLine) < 1) {
                $localI++;
                continue;
            }
            if ($localLine === LESSON_TYPE_LECTURE || $localLine === LESSON_TYPE_PRACTICE) {
                $cc++;
            }
            $elemsL['items'][] = $localLine;
            $localI++;
        }

        if ($cc === 0) {
            $lessonInfo = extractDataFromString(implode(" ", $elemsL['items']));
            list($startTime, $endTime) = explode('-', $elemsL['time']);
            $flatSchedule[$currentGroup][] = [
                'start' => "$currentWeekDay $startTime",
                'end' => "$currentWeekDay $endTime",
                'summary' => $lessonInfo['courseName'],
                'description' => "Type: {$lessonInfo['type']}\nTeacher: {$lessonInfo['teacher']}",
                'location' => $lessonInfo['isOnline'] ? 'Online' : $lessonInfo['cabinet'],
                'url' => $lessonInfo['isOnline'] ? 'https://learn.astanait.edu.kz/' : ''
            ];
        } else {
            for ($j = 0; $j < $cc; $j++) {
                $lessonData = trim(
                    (isset($elemsL['items'][0 + ($j)]) ? trim($elemsL['items'][0 + ($j)]) : '') . ' ' .
                    (isset($elemsL['items'][(1 * $cc) + ($j)]) ? trim($elemsL['items'][(1 * $cc) + ($j)]) : '') . ' ' .
                    (isset($elemsL['items'][(2 * $cc) + ($j)]) ? trim($elemsL['items'][(2 * $cc) + ($j)]) : '') . ' ' .
                    (isset($elemsL['items'][(3 * $cc) + ($j)]) ? trim($elemsL['items'][(3 * $cc) + ($j)]) : '')
                );
                $lessonInfo = extractDataFromString($lessonData);
                list($startTime, $endTime) = explode('-', $elemsL['time']);
                $flatSchedule[$currentGroup][] = [
                    'start' => "$currentWeekDay $startTime",
                    'end' => "$currentWeekDay $endTime",
                    'summary' => $lessonInfo['courseName'],
                    'description' => "Type: {$lessonInfo['type']}\nTeacher: {$lessonInfo['teacher']}",
                    'location' => $lessonInfo['isOnline'] ? 'Online' : $lessonInfo['cabinet'],
                    'url' => $lessonInfo['isOnline'] ? 'https://learn.astanait.edu.kz/' : ''
                ];
            }
        }
        $prevSeq = !$prevSeq;
        $i = $localI;
        $prevIndex = null;
        continue;
    }

    if ($index !== false) {
        $prevSeq = false;
    }

    if ($currentGroup !== null && trim($line) !== '' && $index !== false) {
        $prevIndex = $index;
        $lessonData = trim(substr($line, 11));
        $lessonInfo = extractDataFromString($lessonData);
        list($startTime, $endTime) = explode('-', $index);
        $flatSchedule[$currentGroup][] = [
            'start' => "$currentWeekDay $startTime",
            'end' => "$currentWeekDay $endTime",
            'summary' => $lessonInfo['courseName'],
            'description' => "Type: {$lessonInfo['type']}\nTeacher: {$lessonInfo['teacher']}",
            'location' => $lessonInfo['isOnline'] ? 'Online' : $lessonInfo['cabinet'],
            'url' => $lessonInfo['isOnline'] ? 'https://learn.astanait.edu.kz/' : ''
        ];
        $index = false;
    }
}

// Output the flat schedule for all groups
file_put_contents('data.json', str_replace("\t", " ", json_encode($flatSchedule, JSON_PRETTY_PRINT)));
echo json_encode($flatSchedule, JSON_PRETTY_PRINT);
