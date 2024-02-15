const validatePostPayload = (body) => {
  if (!body) return false;

  const allowedFields = ["first_name", "last_name", "password", "username"];
  const requestFields = Object.keys(body);

  // Check if there are any fields other than the allowed ones
  const hasExtraFields = requestFields.some((f) => !allowedFields.includes(f));

  // Check if any of the required fields are missing
  const isMissingField = allowedFields.some((f) => !requestFields.includes(f));

  return !isMissingField && !hasExtraFields;
};

const validatePutPayload = (body) => {
  if (!body) return false;

  const allowedFields = ["first_name", "last_name", "password"];

  // Get the keys of the request body object
  const keys = Object.keys(body);

  // Check if all keys are allowed fields
  const isValid = keys.every((key) => allowedFields.includes(key));

  return isValid;
};

const validatePayloadValues = (body) => {
  let result = false;
  Object.keys(body).forEach((element) => {
    if (body.hasOwnProperty(element) && body[element] === "") result = true;
  });
  return result;
};

module.exports = {
  validatePostPayload,
  validatePutPayload,
  validatePayloadValues,
};
