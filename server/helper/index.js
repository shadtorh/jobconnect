let updateFields = [];
let queryParams = [];
let paramIndex = 1;
export const addFieldIfProvided = (fieldName, value) => {
	if (value !== undefined) {
		updateFields.push(`${fieldName} = $${paramIndex}`);
		queryParams.push(value);
		paramIndex++;
	}
};
