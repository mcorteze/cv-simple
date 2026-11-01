export const TEMPLATES = [
    { value: 'clasico', label: 'Clásico' },
    { value: 'formal', label: 'Formal' },
    { value: 'moderno', label: 'Moderno' },
];

export const FONT_SIZES = [
    { value: 'pequena', label: 'Pequeña', pt: 9.5 },
    { value: 'normal', label: 'Normal', pt: 10 },
    { value: 'grande', label: 'Grande', pt: 11 },
];

export const MARGINS = [
    { value: 'estrecho', label: 'Estrechos', xMm: 15, yMm: 12 },
    { value: 'normal', label: 'Normales', xMm: 20, yMm: 15 },
    { value: 'amplio', label: 'Amplios', xMm: 25, yMm: 20 },
];

export const SPACINGS = [
    { value: 'compacto', label: 'Compacto', lineHeight: 1.4 },
    { value: 'normal', label: 'Normal', lineHeight: 1.6 },
    { value: 'amplio', label: 'Amplio', lineHeight: 1.75 },
];

export const DEFAULT_FORMAT = {
    template: 'clasico',
    fontSize: 'normal',
    margin: 'normal',
    spacing: 'normal',
};

const OPTIONS_BY_KEY = {
    template: TEMPLATES,
    fontSize: FONT_SIZES,
    margin: MARGINS,
    spacing: SPACINGS,
};

// Descarta valores guardados que ya no existan entre las opciones.
export const normalizeFormat = (saved) => {
    const format = { ...DEFAULT_FORMAT };
    Object.entries(OPTIONS_BY_KEY).forEach(([key, options]) => {
        if (options.some((option) => option.value === saved?.[key])) {
            format[key] = saved[key];
        }
    });
    return format;
};

export const getMargin = (format) => MARGINS.find((m) => m.value === format.margin);

export const getPageVars = (format) => {
    const margin = getMargin(format);
    return {
        '--cv-size': `${FONT_SIZES.find((f) => f.value === format.fontSize).pt}pt`,
        '--cv-line-height': SPACINGS.find((s) => s.value === format.spacing).lineHeight,
        '--cv-margin-x': `${margin.xMm}mm`,
        '--cv-margin-y': `${margin.yMm}mm`,
    };
};
