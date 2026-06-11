export interface ValidationResult {
  valid: boolean;
  code: string;
  message: string;
  severity?: "info" | "warning" | "error";
}

const createSuccess = (): ValidationResult => ({
  valid: true,
  code: "SUCCESS",
  message: "",
});

const createError = (
  code: string,
  message: string,
  severity: "info" | "warning" | "error" = "error"
): ValidationResult => ({
  valid: false,
  code,
  message,
  severity,
});

export const formValidationService = {
  /**
   * Validates standard email patterns
   */
  validateEmail(email: string): ValidationResult {
    if (!email) {
      return createError("REQUIRED_EMAIL", "Email address is required.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createError("INVALID_EMAIL", "Please enter a valid email address.");
    }
    return createSuccess();
  },

  /**
   * Validates E.164 phone formats
   */
  validatePhone(phone: string): ValidationResult {
    if (!phone) {
      return createError("REQUIRED_PHONE", "Phone number is required.");
    }
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return createError("INVALID_PHONE", "Enter a valid phone number (e.g. +1234567890).");
    }
    return createSuccess();
  },

  /**
   * Validates password strength (min 8 chars, 1 uppercase, 1 number)
   */
  validatePassword(password: string): ValidationResult {
    if (!password) {
      return createError("REQUIRED_PASSWORD", "Password is required.");
    }
    if (password.length < 8) {
      return createError("PASSWORD_TOO_SHORT", "Password must be at least 8 characters long.");
    }
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUppercase || !hasNumber) {
      return createError("PASSWORD_WEAK", "Password should contain at least one uppercase letter and one number.", "warning");
    }
    return createSuccess();
  },

  /**
   * Validates unique username alphanumeric filters
   */
  validateUsername(username: string): ValidationResult {
    if (!username) {
      return createError("REQUIRED_USERNAME", "Username is required.");
    }
    if (username.length < 3 || username.length > 20) {
      return createError("USERNAME_LENGTH", "Username must be between 3 and 20 characters.");
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return createError("INVALID_USERNAME", "Username can only contain alphanumeric characters and underscores.");
    }
    return createSuccess();
  },

  /**
   * Validates profile age minimums/maximums
   */
  validateAge(birthday: string | Date, minAge = 18, maxAge = 120): ValidationResult {
    if (!birthday) {
      return createError("REQUIRED_BIRTHDAY", "Birthdate is required.");
    }
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) {
      return createError("INVALID_DATE", "Please enter a valid date format.");
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
       age--;
    }

    if (age < minAge) {
      return createError("UNDERAGE", `You must be at least ${minAge} years old.`);
    }
    if (age > maxAge) {
      return createError("EXCEEDS_MAX_AGE", `Please verify your age is correct.`, "warning");
    }
    return createSuccess();
  },

  /**
   * Validates match age gap limits for dating protection
   */
  validateAgeGap(age1: number, age2: number, maxGap = 25): ValidationResult {
    const gap = Math.abs(age1 - age2);
    if (gap > maxGap) {
      return createError("AGE_GAP_EXCEEDED", `Age difference exceeds the platform safety limit of ${maxGap} years.`, "warning");
    }
    return createSuccess();
  },

  /**
   * Validates link/URL formatting
   */
  validateUrl(url: string): ValidationResult {
    if (!url) {
      return createSuccess();
    }
    try {
      new URL(url);
      return createSuccess();
    } catch {
      return createError("INVALID_URL", "Please enter a valid website URL.");
    }
  },

  /**
   * Validates display name constraints
   */
  validateDisplayName(name: string): ValidationResult {
    if (!name) {
      return createError("REQUIRED_NAME", "Display name is required.");
    }
    if (name.length < 2 || name.length > 50) {
      return createError("NAME_LENGTH", "Display name must be between 2 and 50 characters.");
    }
    return createSuccess();
  },

  /**
   * Validates user bio lengths
   */
  validateBio(bio: string): ValidationResult {
    if (bio && bio.length > 160) {
      return createError("BIO_LENGTH", "Bio cannot exceed 160 characters.");
    }
    return createSuccess();
  },

  /**
   * Validates community title rules
   */
  validateCommunityName(name: string): ValidationResult {
    if (!name) {
      return createError("REQUIRED_COMMUNITY_NAME", "Community name is required.");
    }
    if (name.length < 3 || name.length > 30) {
      return createError("COMMUNITY_NAME_LENGTH", "Community name must be between 3 and 30 characters.");
    }
    return createSuccess();
  },

  /**
   * Validates community slugs
   */
  validateCommunitySlug(slug: string): ValidationResult {
    if (!slug) {
      return createError("REQUIRED_COMMUNITY_SLUG", "Community URL slug is required.");
    }
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return createError("INVALID_COMMUNITY_SLUG", "URL slug can only contain lowercase letters, numbers, and hyphens.");
    }
    return createSuccess();
  },

  /**
   * Validates chronological start/end scheduling
   */
  validateEventDates(start: string | Date, end: string | Date): ValidationResult {
    if (!start || !end) {
      return createError("REQUIRED_EVENT_DATES", "Start and End dates are required.");
    }
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return createError("INVALID_EVENT_DATES", "Please select valid calendar dates.");
    }

    if (startDate < new Date()) {
      return createError("EVENT_PAST_START", "Event cannot start in the past.");
    }

    if (endDate <= startDate) {
      return createError("EVENT_END_BEFORE_START", "End time must be after the start time.");
    }

    return createSuccess();
  },

  /**
   * Validates locations
   */
  validateEventLocation(location: string): ValidationResult {
    if (!location) {
      return createError("REQUIRED_LOCATION", "Event location or online link is required.");
    }
    if (location.length < 5) {
      return createError("LOCATION_SHORT", "Please enter more descriptive location details.");
    }
    return createSuccess();
  },

  /**
   * Validates creator handles
   */
  validateCreatorHandle(handle: string): ValidationResult {
    if (!handle) {
      return createError("REQUIRED_HANDLE", "Creator handle is required.");
    }
    const handleRegex = /^[a-z0-9_-]{3,20}$/;
    if (!handleRegex.test(handle)) {
      return createError("INVALID_CREATOR_HANDLE", "Creator handle must be between 3-20 lowercase alphanumeric characters.");
    }
    return createSuccess();
  },

  /**
   * Social Feed Validators
   */
  validatePostTitle(title: string): ValidationResult {
    if (!title) {
      return createError("REQUIRED_POST_TITLE", "Post title is required.");
    }
    if (title.length < 3 || title.length > 100) {
      return createError("POST_TITLE_LENGTH", "Post title must be between 3 and 100 characters.");
    }
    return createSuccess();
  },

  validatePostContent(content: string): ValidationResult {
    if (!content) {
      return createError("REQUIRED_POST_CONTENT", "Post content cannot be empty.");
    }
    if (content.length > 5000) {
      return createError("POST_CONTENT_TOO_LONG", "Post content cannot exceed 5000 characters.");
    }
    return createSuccess();
  },

  validateComment(comment: string): ValidationResult {
    if (!comment) {
      return createError("REQUIRED_COMMENT", "Comment cannot be empty.");
    }
    if (comment.length > 1000) {
      return createError("COMMENT_TOO_LONG", "Comment cannot exceed 1000 characters.");
    }
    return createSuccess();
  },

  validateHashtags(tags: string[]): ValidationResult {
    if (tags.length > 10) {
      return createError("TOO_MANY_HASHTAGS", "You can specify a maximum of 10 hashtags.", "warning");
    }
    for (const tag of tags) {
      if (!/^[a-zA-Z0-9_]+$/.test(tag)) {
        return createError("INVALID_HASHTAG", `Hashtag #${tag} contains invalid characters.`);
      }
    }
    return createSuccess();
  },

  /**
   * Messaging Validators
   */
  validateMessage(message: string): ValidationResult {
    if (!message || message.trim().length === 0) {
      return createError("REQUIRED_MESSAGE", "Message body cannot be empty.");
    }
    if (message.length > 2000) {
      return createError("MESSAGE_TOO_LONG", "Message cannot exceed 2000 characters.");
    }
    return createSuccess();
  },

  validateAttachment(fileSize: number, fileType: string): ValidationResult {
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (fileSize > MAX_SIZE) {
      return createError("ATTACHMENT_TOO_LARGE", "Attachment size cannot exceed 50MB.");
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "application/pdf"];
    if (!allowedTypes.includes(fileType)) {
      return createError("INVALID_ATTACHMENT_TYPE", "Unsupported file type format.", "warning");
    }
    return createSuccess();
  },

  /**
   * Dating Validators
   */
  validateDatingBio(bio: string): ValidationResult {
    if (!bio) {
      return createError("REQUIRED_DATING_BIO", "Dating profile bio is required.");
    }
    if (bio.length < 20 || bio.length > 300) {
      return createError("DATING_BIO_LENGTH", "Dating bios must be between 20 and 300 characters.");
    }
    return createSuccess();
  },

  validateDatingPhotos(photosCount: number): ValidationResult {
    if (photosCount < 2) {
      return createError("MIN_PHOTOS_REQUIRED", "Please upload at least 2 profile photos to build trust.");
    }
    if (photosCount > 6) {
      return createError("MAX_PHOTOS_EXCEEDED", "Dating profiles support a maximum of 6 photos.", "info");
    }
    return createSuccess();
  },

  validateGenderSelection(gender: string): ValidationResult {
    if (!gender) {
      return createError("REQUIRED_GENDER", "Please specify your gender identity selection.");
    }
    return createSuccess();
  },

  /**
   * Communities Validators
   */
  validateCommunityDescription(description: string): ValidationResult {
    if (!description) {
      return createError("REQUIRED_COMMUNITY_DESC", "Community description is required.");
    }
    if (description.length < 10 || description.length > 500) {
      return createError("COMMUNITY_DESC_LENGTH", "Community description must be between 10 and 500 characters.");
    }
    return createSuccess();
  },

  validateCommunityRules(rules: string[]): ValidationResult {
    if (!rules || rules.length === 0) {
      return createError("REQUIRED_RULES", "Please specify at least 1 community rule.", "warning");
    }
    if (rules.length > 10) {
      return createError("RULES_LIMIT_EXCEEDED", "You can define a maximum of 10 community rules.");
    }
    return createSuccess();
  },

  /**
   * Events Validators
   */
  validateEventCapacity(capacity: number): ValidationResult {
    if (capacity <= 0) {
      return createError("INVALID_CAPACITY", "Event capacity must be at least 1 person.");
    }
    if (capacity > 100000) {
      return createError("CAPACITY_WARNING", "Events with capacities over 100,000 need staff clearance.", "warning");
    }
    return createSuccess();
  },

  validateEventTimezone(timezone: string): ValidationResult {
    if (!timezone) {
      return createError("REQUIRED_TIMEZONE", "Event timezone selection is required.");
    }
    return createSuccess();
  }
};

/**
 * Centered registry containing all validators for form builders or schema evaluations
 */
export const validationRegistry: Record<string, (val: any, ...args: any[]) => ValidationResult> = {
  email: formValidationService.validateEmail,
  phone: formValidationService.validatePhone,
  password: formValidationService.validatePassword,
  username: formValidationService.validateUsername,
  age: formValidationService.validateAge,
  ageGap: formValidationService.validateAgeGap,
  url: formValidationService.validateUrl,
  displayName: formValidationService.validateDisplayName,
  bio: formValidationService.validateBio,
  communityName: formValidationService.validateCommunityName,
  communitySlug: formValidationService.validateCommunitySlug,
  eventDates: (val: { start: string | Date; end: string | Date }) =>
    formValidationService.validateEventDates(val?.start, val?.end),
  eventLocation: formValidationService.validateEventLocation,
  creatorHandle: formValidationService.validateCreatorHandle,
  postTitle: formValidationService.validatePostTitle,
  postContent: formValidationService.validatePostContent,
  comment: formValidationService.validateComment,
  hashtags: formValidationService.validateHashtags,
  message: formValidationService.validateMessage,
  attachment: (val: { size: number; type: string }) =>
    formValidationService.validateAttachment(val?.size, val?.type),
  datingBio: formValidationService.validateDatingBio,
  datingPhotos: formValidationService.validateDatingPhotos,
  genderSelection: formValidationService.validateGenderSelection,
  communityDescription: formValidationService.validateCommunityDescription,
  communityRules: formValidationService.validateCommunityRules,
  eventCapacity: formValidationService.validateEventCapacity,
  eventTimezone: formValidationService.validateEventTimezone,
};
