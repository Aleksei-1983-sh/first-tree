# Project Rules

## Scope

- Keep the existing file structure in place.
- Do not delete files unless the user explicitly asks for that.
- The runtime should stay focused on a minimal `three.js` + physics playground.
- The active entry path is `index.html` -> `main.js` -> `core/Game.js`.
- The scene should stay simple in the near term: one platform, a small set of cubes, and physics.
- The long-term learning target is a tiny destruction mini-game: a compact structure, throwable projectiles, simple collapse behavior, and a clear reset loop.
- Legacy files in `entities/` and `utils/` remain as учебные заглушки and are not part of the active runtime unless this file is updated.

## Change Log

- 2026-06-02: Reworked the project toward a minimal playground layout, removed the FPS-specific runtime flow, and kept the existing project files intact.
- 2026-06-02: Simplified `entities/` and `utils/` into placeholder modules and documented the step-by-step learning path toward a small destruction-game prototype.

## Maintenance Rule

- Any future project change must be reflected in this file on the same patch.
- If runtime files, dependencies, or the scene scope change, update the scope and change log above before finishing the task.

## Обучающий План

Ниже план развития проекта с нарастающей сложностью. Он рассчитан на последовательное обучение, а не на сразу готовую "большую" игру.

### Этап 1. Базовая сцена и наблюдение

- Оставить один активный путь запуска: `index.html` -> `main.js` -> `core/Game.js`.
- Поддерживать простую сцену с одной платформой и несколькими кубами.
- Довести визуальную читаемость до состояния "можно сразу понять, что происходит".
- Научиться отделять активный runtime от устаревших учебных файлов.

Результат этапа: сцена запускается стабильно, кубы стоят на платформе, физика видна в действии.

### Этап 2. Учебные заглушки и структура кода

- Свести `entities/` и `utils/` к минимальным placeholder-модулям.
- Сохранить имена файлов и экспортов как ориентир для будущего развития.
- Убрать из этих модулей любую сложную игровую логику.
- Зафиксировать мысль, что архитектура может расти, но сейчас она намеренно пустая.

Результат этапа: старые модули не мешают, но остаются как понятная заготовка для обучения.

### Этап 3. Мини-игровая механика разрушения

- Добавить в сцену компактную "конструкцию" из блоков.
- Реализовать источник воздействия: бросок шара, импульс, толчок или другой простой способ разрушения.
- Сделать кубы разрушаемыми или смещаемыми от столкновений.
- Сохранять визуальную простоту, чтобы механика была главным объектом внимания.

Результат этапа: игрок может разрушать конструкцию и видеть физический отклик.

### Этап 4. Игровой цикл

- Добавить понятную цель: разрушить конструкцию за минимальное число действий или за ограниченное время.
- Ввести кнопку/действие для перезапуска сцены.
- Показывать короткий HUD: цель, состояние, количество попыток или попаданий.
- Держать правила простыми, без сложного сюжета и без лишних систем.

Результат этапа: это уже не просто демонстрация физики, а маленькая игра.

### Этап 5. Углубление обучения

- Улучшить столкновения, стабильность и поведение объектов.
- Добавить несколько типов блоков с разной прочностью или массой.
- Сравнить два подхода: чисто визуальное разрушение и физически связанное разрушение.
- Отдельно разбирать, какие части логики относятся к сцене, физике, интерфейсу и правилам игры.

Результат этапа: проект становится учебной площадкой, где видно, как растёт простая игра до более цельного прототипа.
