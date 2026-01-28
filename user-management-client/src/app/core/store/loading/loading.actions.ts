import { createAction, props } from '@ngrx/store';

export const showLoading = createAction('[Loading] Show Loading');
export const hideLoading = createAction('[Loading] Hide Loading');
export const setLoading = createAction('[Loading] Set Loading', props<{ isLoading: boolean }>());
