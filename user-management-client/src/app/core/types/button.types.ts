/**
 * Material Design button color types
 */
export type MaterialButtonColor = 'primary' | 'accent' | 'warn';

/**
 * Material Design button variant types
 */
export type MaterialButtonVariant = 'raised' | 'flat' | 'stroked';

/**
 * HTML button type attribute values
 */
export type ButtonType = 'button' | 'submit' | 'reset';

/** Default type for submit button */
export const DEFAULT_SUBMIT_BUTTON_TYPE: ButtonType = 'submit';

/** Default variant for submit button */
export const DEFAULT_SUBMIT_BUTTON_VARIANT: MaterialButtonVariant = 'raised';
