import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";

const vDompurify = buildVueDompurifyHTMLDirective({
  default: {
    ALLOWED_TAGS: [
      "strong",
      "b",
      "i",
      "em",
      "a",
      "br",
      "p",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
    ],
    FORBID_ATTR: ["style"],
  },
  hooks: {
    afterSanitizeAttributes: (node) => {
      if ("target" in node) {
        node.setAttribute("target", "_blank");
        node.setAttribute("class", "text-primary underline underline-offset-4");
      }
    },
  },
});

export { vDompurify };
