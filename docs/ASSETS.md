# 🎨 Обработка ассетов

Исходный архив содержал **40 файлов** с UUID-именами и русскими каталогами. Каждый файл был просмотрен, классифицирован и переименован.

## Что было сделано

- исправлены названия каталогов, включая опечатку `Хищьная рыба`;
- UUID-файлы получили понятные английские имена;
- цельные рыбки, кораллы, камни и пузырьки вырезаны из больших sprite sheet;
- прозрачные пустые поля удалены;
- изображения уменьшены под реальный размер отображения;
- графика собрана в пять компактных WebP-атласов;
- звуки переведены в компактный OGG/Opus;
- сохранён файл соответствий [`asset-map.json`](asset-map.json).

## Runtime-атласы

| Файл | Содержимое |
|---|---|
| `fish-a.webp` | рыба-клоун, скалярия, тропическая рыба, рыба-бабочка |
| `fish-b.webp` | золотая рыбка, голубой хирург, барракуда |
| `decor-a.webp` | шесть видов кораллов и рифов |
| `decor-b.webp` | ракушки, морская звезда и камни |
| `creatures.webp` | улитки, креветки и три типа пузырьков |

Координаты всех элементов находятся в `assets/manifest.json`.

## Названия исходных коллекций

- `clownfish-spritesheet.png`
- `angelfish-spritesheet.png`
- `tropical-fish-spritesheet.png`
- `butterflyfish-spritesheet.png`
- `goldfish-spritesheet.png`
- `blue-tang-spritesheet.png`
- `barracuda-spritesheet.png`
- `coral-reef-collection.png`
- `shells-and-starfish-collection.png`
- `rock-formations-collection.png`
- `seabed-props-atlas.png`
- `bubble-soft-spritesheet.png`
- `bubble-outline-spritesheet.png`
- `bubble-blue-spritesheet.png`
- `underwater-background.png`
- `sand-seabed-texture.png`
- `caustics-fine.png`
- `caustics-wide.png`

> В исходном архиве не было информации о лицензиях. Перед коммерческим распространением следует проверить происхождение материалов.
