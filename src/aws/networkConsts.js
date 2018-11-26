export const STATUS_LOADING = 'STATUS_LOADING';
export const STATUS_FAILURE = 'STATUS_FAILURE';
export const STATUS_SUCCESS = 'STATUS_SUCCESS';

export const defaultErrorResponse = {
    status: 'Unknown',
    data: {
        message: 'Some error occured',
        code: 'Unknown'
    }
};