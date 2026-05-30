export const slugify = (value) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

export const courseSlug = (course, fallback = "") => (
  course?.slug || slugify(course?.title || course?.name || course?.course || fallback)
);

export const courseClassHref = (course, fallback = null) => {
  const slug = courseSlug(course, fallback);

  return slug ? `/tutor/classes/${slug}` : "/tutor/classes";
};

export const courseLearnHref = (course, fallback = null) => {
  const slug = courseSlug(course, fallback);

  return slug ? `/course/${slug}/learn` : "/dashboard";
};

export const courseDetailHref = (course, fallback = null) => {
  const slug = courseSlug(course, fallback);

  return slug ? `/course/${slug}` : "/#katalog";
};

export const packageSlug = (learningPackage, fallback = "") => (
  learningPackage?.slug || slugify(learningPackage?.name || fallback)
);

export const packageCheckoutHref = (learningPackage, fallback = null) => {
  const slug = packageSlug(learningPackage, fallback);

  return slug ? `/checkout/package/${slug}` : "/#katalog";
};

export const transactionStatusHref = (transaction) => {
  const reference = transaction?.invoice_number || transaction?.invoiceNumber || transaction?.order_id || transaction?.id;

  return reference ? `/payment-status/${reference}` : "/dashboard";
};
