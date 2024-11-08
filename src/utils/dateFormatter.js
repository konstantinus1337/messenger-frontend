// src/utils/dateFormatter.js
import { format, formatDistance, formatRelative, isToday, isYesterday } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatMessageDate = (date) => {
    const messageDate = new Date(date);

    if (isToday(messageDate)) {
        return format(messageDate, 'HH:mm');
    }

    if (isYesterday(messageDate)) {
        return 'Вчера ' + format(messageDate, 'HH:mm');
    }

    return format(messageDate, 'dd.MM.yyyy HH:mm');
};

export const formatLastActive = (date) => {
    return formatDistance(new Date(date), new Date(), {
        addSuffix: true,
        locale: ru
    });
};

export const formatProfileDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: ru });
};

export const formatRelativeTime = (date) => {
    return formatRelative(new Date(date), new Date(), { locale: ru });
};

export default {
    formatMessageDate,
    formatLastActive,
    formatProfileDate,
    formatRelativeTime
};