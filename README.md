# Living Aquarium — V8 Marine Genetics branch

Эта ветка собирает V8 как третий слой проекта: стабильный V6 Ocean Lab остаётся базой, V7 добавляет Deep Sea Expedition, а V8 подключает отдельную Marine Genetics Lab.

## Точки входа в исходниках

- `index.html` — базовый V6;
- `v7.html` — V6 + Deep Sea Expedition;
- `v8.html` — V6 + V7 + Marine Genetics Lab.

Для этой ветки актуальная точка входа — `v8.html`.

## Marine Genetics Lab

Лаборатория открывается клавишей `G`. В ней пять локусов генома: окраска, плавники, размер, свечение и устойчивость.

Есть шесть родительских линий. Коралловая и жемчужная доступны сразу; остальные открываются через лабораторный XP, прогресс V7 и каталог фенотипов.

Пользователь может секвенировать линии, получать ДНК, синтезировать реагенты, скрещивать родителей, стабилизировать эмбрионы и выращивать гибридов. При скрещивании возможны мутации.

В атласе восемь фенотипов, а отдельная система достижений отслеживает развитие лаборатории.

## Связь с V7

V8 может один раз использовать уже найденные глубоководные образцы как источник бонусной ДНК и XP. Данные V7 при этом не изменяются.

Прогресс V8 хранится отдельно:

```text
aquarium-v8-genetics
```

## Запуск из исходников

```bash
python -m http.server 8080
```

Откройте `http://localhost:8080/v8.html`.

## Сборка релиза

```bash
python3 scripts/build-v8-release.py dist/v8-stage
```

Сборщик распаковывает V6 runtime, добавляет `v7-expedition.js` и `v8-genetics.js`, заменяет manifest и Service Worker на V8-варианты и формирует готовый каталог, где актуальная версия запускается через обычный `index.html`.

## Проверка

```bash
node --check bootstrap-v8.js
node --check v8-genetics.js
node tests/deep-sea-overlay-test.js
node tests/genetics-lab-test.js
node tests/v8-runtime-test.js
python3 scripts/build-v8-release.py dist/v8-stage
```

## Документация

- [`README-V7.md`](README-V7.md) — Deep Sea Expedition;
- [`README-V8.md`](README-V8.md) — Marine Genetics Lab;
- [`CHANGELOG-V7.md`](CHANGELOG-V7.md) и [`CHANGELOG-V8.md`](CHANGELOG-V8.md) — изменения overlay-линий;
- [`RELEASE_NOTES_V7.md`](RELEASE_NOTES_V7.md) и [`RELEASE_NOTES-V8.md`](RELEASE_NOTES-V8.md) — релизные описания;
- корневые `CHANGELOG.md` и `RELEASE_NOTES.md` относятся к базовой V6.

V8 не требует отдельного backend: все три слоя работают в браузере и используют независимые локальные сохранения там, где это предусмотрено модулем.