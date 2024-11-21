// utils/messageUtils.js
export const groupMessages = (messages) => {
    if (!messages.length) return [];

    // Убедимся, что сообщения отсортированы по времени
    const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const groups = [];
    let currentGroup = [sortedMessages[0]];

    for (let i = 1; i < sortedMessages.length; i++) {
        const currentMessage = sortedMessages[i];
        const previousMessage = sortedMessages[i - 1];

        // Проверяем условия для группировки:
        // 1. Сообщения от одного отправителя
        // 2. Разница во времени меньше 5 минут
        // 3. Сообщения одного типа (обычное, системное и т.д.)
        const sameUser = currentMessage.sender?.id === previousMessage.sender?.id;
        const timeDiff = Math.abs(
            new Date(currentMessage.timestamp) - new Date(previousMessage.timestamp)
        );
        const withinTimeLimit = timeDiff < 5 * 60 * 1000; // 5 минут
        const sameType = currentMessage.type === previousMessage.type;

        if (sameUser && withinTimeLimit && sameType) {
            currentGroup.push(currentMessage);
        } else {
            groups.push([...currentGroup]);
            currentGroup = [currentMessage];
        }
    }

    // Добавляем последнюю группу
    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    return groups;
};

export const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

export const isToday = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

export const isYesterday = (timestamp) => {
    const date = new Date(timestamp);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    );
};

export const formatMessageDate = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);

    if (isToday(timestamp)) {
        return formatMessageTime(timestamp);
    }

    if (isYesterday(timestamp)) {
        return `Вчера, ${formatMessageTime(timestamp)}`;
    }

    // Для более старых сообщений показываем полную дату
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getFileIcon = (filename) => {
    if (!filename) return 'file';

    const extension = filename.split('.').pop().toLowerCase();

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const documentExtensions = ['doc', 'docx', 'pdf', 'txt', 'rtf', 'odt'];
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];

    if (imageExtensions.includes(extension)) return 'image';
    if (documentExtensions.includes(extension)) return 'document';
    if (archiveExtensions.includes(extension)) return 'archive';
    if (videoExtensions.includes(extension)) return 'video';
    if (audioExtensions.includes(extension)) return 'audio';
    return 'file';
};

export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Проверка, должно ли отображаться полное время для сообщения
export const shouldShowFullTimestamp = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.timestamp);
    const previousDate = new Date(previousMessage.timestamp);

    // Показываем полную дату если:
    // 1. Разница во времени больше 5 минут
    // 2. Сообщения от разных пользователей
    // 3. Сообщения в разные дни
    const timeDiff = Math.abs(currentDate - previousDate);
    const differentUsers = currentMessage.sender?.id !== previousMessage.sender?.id;
    const differentDays = currentDate.getDate() !== previousDate.getDate();

    return timeDiff > 5 * 60 * 1000 || differentUsers || differentDays;
};

// Определение, нужно ли показывать дату как разделитель между сообщениями
export const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.timestamp);
    const previousDate = new Date(previousMessage.timestamp);

    return (
        currentDate.getDate() !== previousDate.getDate() ||
        currentDate.getMonth() !== previousDate.getMonth() ||
        currentDate.getFullYear() !== previousDate.getFullYear()
    );
};

// Форматирование даты для разделителя
export const formatDateSeparator = (timestamp) => {
    const date = new Date(timestamp);

    if (isToday(timestamp)) {
        return 'Сегодня';
    }

    if (isYesterday(timestamp)) {
        return 'Вчера';
    }

    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};