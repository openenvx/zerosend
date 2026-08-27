export class TemplateNotFoundError extends Error {
  readonly name = 'TemplateNotFoundError';

  constructor(templateId: string) {
    super(`Template not found: ${templateId}`);
  }
}

export class TemplateNotPublishedError extends Error {
  readonly name = 'TemplateNotPublishedError';

  constructor(templateId: string) {
    super(`Template is not published: ${templateId}`);
  }
}
