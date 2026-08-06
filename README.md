# Living Aquarium — V9 Reef Restoration branch

Эта ветка собирает Living Aquarium V9 поверх трёх предыдущих слоёв: V6 Ocean Lab, V7 Deep Sea Expedition и V8 Marine Genetics Lab. V9 добавляет Reef Restoration Center и при этом сохраняет отдельные данные каждого overlay.

## Точки входа в исходниках

- `index.html` — базовый V6;
- `v7.html` — V6 + Deep Sea Expedition;
- `v8.html` — V6 + V7 + Marine Genetics Lab;
- `v9.html` — полный стек V6–V9.

Для этой ветки актуальная точка входа — `v9.html`.

## Reef Restoration Center

Центр открывается клавишей `R`. В нём четыре сектора с отдельными показателями здоровья, загрязнения и теплового стресса:

| Сектор | Глубина | Репутация для открытия | Колоний на проект высадки |
| --- | --- | ---: | ---: |
| Лагуна рассвета | 2–8 м | 0 | 1 |
| Коралловый сад | 8–18 м | 110 | 2 |
| Внешний шельф | 18–35 м | 270 | 3 |
| Голубая впадина | 35–70 м | 520 | 4 |

В каждом секторе доступны обследование, очистка дронами, охлаждение и высадка восстановленных колоний. После экологических проектов могут происходить случайные климатические события.

## Питомник

Питомник рассчитан максимум на шесть фрагментов одновременно. Доступны четыре культуры: ветвистая акропора, морской веер, мозговой коралл и ламинариевый купол.

Для посадки одного фрагмента требуется 2 единицы материала. После созревания культура даёт 2–3 колонии. Прогресс V7/V8 может немного сократить время выращивания.

## Наследие V7 и V8

V9 может один раз начислить стартовый бонус по данным Deep Sea Expedition и Marine Genetics Lab: учитываются погружения, открытые образцы, фенотипы и гибриды. Предыдущие сохранения только читаются и не изменяются.

Прогресс V9 хранится отдельно:

```text
aquarium-v9-restoration
```

## Запуск

```bash
python -m http.server 8080
```

Откройте `http://localhost:8080/v9.html`.

## Сборка релиза

```bash
python3 scripts/build-v9-release.py dist/v9-stage
```

Сборщик распаковывает V6 runtime, добавляет V7, V8 и V9, подменяет manifest/Service Worker и формирует готовый каталог, где актуальная версия запускается через обычный `index.html`.

## Проверка

```bash
node --check bootstrap-v9.js
node --check v9-restoration.js
node --check service-worker-v9.js
node tests/deep-sea-overlay-test.js
node tests/genetics-lab-test.js
node tests/restoration-center-test.js
node tests/v9-runtime-test.js
python3 scripts/build-v9-release.py dist/v9-stage
```

## Документация

Документы `README-V7.md`, `README-V8.md` и `README-V9.md` описывают каждый overlay отдельно. Аналогично разделены changelog и release notes. Корневые `CHANGELOG.md` и `RELEASE_NOTES.md` относятся к базовой линии V6.
