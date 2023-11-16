<?php

namespace App\Fixtures\Providers;

class CategorieProvider
{
    public function generateTagTitle(): string
    {
        $tags = [
            'Symfony',
            'Api Rest',
            'Php',
            'Frontend',
            'Backend',
            'FullStack',
            'VueJs',
            'Rust',
            'Javascript',
            'Sass',
            'HTML',
            'CSS',
        ];

        return $tags[array_rand($tags)];
    }
}
