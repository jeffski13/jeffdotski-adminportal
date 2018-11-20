export const FORM_SUCCESS = 'success';
export const FORM_ERROR = 'error';

export function validateFormString(str) {
	if (str && typeof str === 'string' && str.length > 0) {
		//fire state valid action
		return FORM_SUCCESS;
	}
	else {
		//fire state invalid action
		return FORM_ERROR;
	}
}

export function validateFormPositiveNumber(inputNum) {
	let num = parseInt(inputNum);
	if (num && typeof num === 'number' && num > 0) {
		//fire state valid action
		return FORM_SUCCESS;
	}
	else {
		//fire state invalid action
		return FORM_ERROR;
	}
}

export function validateDate(dateNum) {
	if (dateNum && dateNum > 0) {
		//fire state valid action
		return FORM_SUCCESS;
	}
	else {
		//fire state invalid action
		return FORM_ERROR;
	}
}