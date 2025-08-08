import Joi from "joi";

export const infoSubmissionSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    // .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Enter a valid email",
    }),
  username: Joi.string()
    .max(35)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.max": "Username cannot exceed 35 characters",
    }),

  verificationCode: Joi.string().required().messages({
    "string.empty": "Verification code is required",
  }),
  termsAccepted: Joi.valid("on").required().messages({
    "any.required": "You must accept the terms and conditions",
    "any.only": "You must accept the terms and conditions",
  }),
});

export const formValidation = (state, schema) => {
  const { error } = schema.validate(state, {
    abortEarly: false,
  });
  if (error) {
    const errors = error.details.reduce((acc, err) => {
      acc[err.context.key] = err.message.replace(/"/g, "");
      return acc;
    }, {});
    return { error: errors };
  }
  return { success: "User input validation successful" };
};
