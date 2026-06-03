#!/bin/bash

# Выходной файл
OUTPUT="project_snapshot.txt"

# Очистить предыдущий вывод (если нужен)
> "$OUTPUT"

# Какие директории исключить (имена папок, не пути)
EXCLUDE_DIRS=("node_modules" ".git" "dist" "build" "coverage" ".vscode" ".idea" "__pycache__" ".cache")

# Какие расширения файлов исключить (бинарные/медиа)
EXCLUDE_EXT=("png" "jpg" "jpeg" "gif" "bmp" "ico" "svg" "mp4" "mp3" "wav" "webm" "bin" "exe" "dll" "so" "dylib" "zip" "tar" "gz" "7z" "pdf" "doc" "docx" "xls" "xlsx" "ttf" "woff" "woff2" "eot" "otf")

# Функция проверки, нужно ли исключить файл
should_exclude() {
    local file="$1"
    # Исключаем директории по имени (не по полному пути)
    for excl in "${EXCLUDE_DIRS[@]}"; do
        if [[ "$file" == *"/$excl/"* ]] || [[ "$file" == "$excl/"* ]] || [[ "$file" == *"/$excl" ]]; then
            return 0
        fi
    done
    # Исключаем по расширению
    local ext="${file##*.}"
    for excl_ext in "${EXCLUDE_EXT[@]}"; do
        if [[ "$ext" == "$excl_ext" ]]; then
            return 0
        fi
    done
    return 1
}

# Рекурсивный обход файлов
find . -type f | while read -r file; do
    # Убираем ведущий './'
    rel_path="${file#./}"
    
    # Проверяем исключения
    if should_exclude "$rel_path"; then
        echo "Пропускаем: $rel_path"
        continue
    fi
    
    # Проверяем, является ли файл текстовым (простая проверка через file)
    if file --mime-type "$file" | grep -qE 'text/|application/json|application/javascript|application/xml|application/x-sh'; then
        echo "Добавляем: $rel_path"
        echo "==================== FILE: $rel_path ====================" >> "$OUTPUT"
        cat "$file" >> "$OUTPUT"
        echo -e "\n\n" >> "$OUTPUT"
    else
        echo "Пропускаем (бинарный): $rel_path"
    fi
done

echo "Готово! Результат в файле: $OUTPUT"