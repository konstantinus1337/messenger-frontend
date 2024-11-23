// src/utils/dateFormatter.js
import { format, formatDistance, formatRelative, isToday, isYesterday, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatMessageDate = (date) => {
    const messageDate = new Date(date);

    if (!isValid(messageDate)) {
        return 'Некорректная дата';
    }

    if (isToday(messageDate)) {
        return format(messageDate, 'HH:mm');
    }

    if (isYesterday(messageDate)) {
        return 'Вчера ' + format(messageDate, 'HH:mm');
    }

    return format(messageDate, 'dd.MM.yyyy HH:mm');
};

export const formatLastActive = (date) => {
    const lastActiveDate = new Date(date);

    if (!isValid(lastActiveDate)) {
        return 'Некорректная дата';
    }

    return formatDistance(lastActiveDate, new Date(), {
        addSuffix: true,
        locale: ru
    });
};

export const formatProfileDate = (date) => {
    const profileDate = new Date(date);

    if (!isValid(profileDate)) {
        return 'Некорректная дата';
    }

    return format(profileDate, 'dd MMMM yyyy', { locale: ru });
};

export const formatRelativeTime = (date) => {
    const relativeDate = new Date(date);

    if (!isValid(relativeDate)) {
        return 'Некорректная дата';
    }

    return formatRelative(relativeDate, new Date(), { locale: ru });
};

export default {
    formatMessageDate,
    formatLastActive,
    formatProfileDate,
    formatRelativeTime
};