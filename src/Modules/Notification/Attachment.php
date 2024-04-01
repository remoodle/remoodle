<?php

declare(strict_types=1);

namespace App\Modules\Notification;

use Core\CommonContracts\Arrayable;

class Attachment implements Arrayable
{
    public const TYPE_IMAGE_JPG = "jpg";
    public const TYPE_IMAGE_PNG = "png";
    public const TYPE_IMAGE_GIF = "gif";
    public const TYPE_IMAGE_JPEG = "jpeg";
    public const TYPE_VIDEO_MP3 = "mp3";
    public const TYPE_VIDEO_MP4 = "MP4";
    public const TYPE_VIDEO_AVI = "avi";
    public const TYPE_DOCUMENT_PDF = "pdf";
    public const TYPE_DOCUMENT_DOCX = "docx";
    public const TYPE_DOCUMENT_DOC = "doc";
    public const TYPE_DOCUMENT_XLSX = "xlsx";
    public const TYPE_DOCUMENT_CSV = "csv";
    public const TYPE_DOCUMENT_PPTX = "pptx";

    public function __construct(
        protected string $url,
        protected string $title,
        protected string $fileType
    ) {
    }

    public function toArray(): array
    {
        return [
            "url" => $this->url,
            "title" => $this->title,
            "fileType" => $this->fileType
        ];
    }
}
