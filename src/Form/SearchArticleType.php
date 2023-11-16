<?php

namespace App\Form;

use App\Entity\Categorie;
use App\Entity\User;
use App\Search\SearchArticle;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SearchArticleType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('title', TextType::class, [
                'label' => 'Titre:',
                'attr' => [
                    'placeholder' => 'Chercher par titre',
                ],
                'required' => false,
            ])
            ->add('tags', EntityType::class, [
                'label' => 'Catégories:',
                'class' => Categorie::class,
                'choice_label' => 'title',
                'query_builder' => function (EntityRepository $er): QueryBuilder {
                    return $er->createQueryBuilder('c')
                        ->innerJoin('c.articles', 'a')
                        ->andWhere('c.enable = true')
                        ->orderBy('c.title', 'ASC');
                },
                'expanded' => true,
                'multiple' => true,
                'required' => false,
            ])
            ->add('authors', EntityType::class, [
                'label' => 'Auteurs:',
                'class' => User::class,
                'choice_label' => 'fullName',
                'query_builder' => function (EntityRepository $er): QueryBuilder {
                    return $er->createQueryBuilder('u')
                        ->innerJoin('u.articles', 'a')
                        ->andWhere('a.enable = true')
                        ->orderBy('u.lastName', 'ASC');
                },
                'expanded' => true,
                'multiple' => true,
                'required' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => SearchArticle::class,
            'method' => 'GET',
            'csrf_protection' => false,
        ]);
    }

    public function getBlockPrefix(): string
    {
        return '';
    }
}
