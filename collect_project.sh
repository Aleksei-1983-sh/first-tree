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

# Проверяем, является ли файл текстовым.
# Если утилиты `file` нет в окружении, используем понятный список текстовых расширений.
is_text_file() {
    local file="$1"

    if command -v file >/dev/null 2>&1; then
        file --mime-type "$file" | grep -qE 'text/|application/json|application/javascript|application/xml|application/x-sh'
        return $?
    fi

    case "$file" in
        *.html|*.css|*.js|*.json|*.md|*.sh|*.txt) return 0 ;;
        *) return 1 ;;
    esac
}

# Рекурсивный обход файлов
first_file=true
find . -type f | while read -r file; do
    # Убираем ведущий './'
    rel_path="${file#./}"

    # Не добавляем выходной файл в самого себя, иначе cat выдаст предупреждение.
    if [[ "$rel_path" == "$OUTPUT" ]]; then
        continue
    fi

    # Проверяем исключения
    if should_exclude "$rel_path"; then
        echo "Пропускаем: $rel_path"
        continue
    fi

    # Проверяем, является ли файл текстовым.
    if is_text_file "$file"; then
        echo "Добавляем: $rel_path"
        if [[ "$first_file" == true ]]; then
            first_file=false
        else
            echo -e "\n\n" >> "$OUTPUT"
        fi
        echo "==================== FILE: $rel_path ====================" >> "$OUTPUT"
        cat "$file" >> "$OUTPUT"
    else
        echo "Пропускаем (бинарный): $rel_path"
    fi
done

echo "Готово! Результат в файле: $OUTPUT"
