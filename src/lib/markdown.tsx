import type { Components } from "react-markdown";

export const markdownComponents: Components = {
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-4 rounded-lg border border-border">
      <table {...props}>{children}</table>
    </div>
  ),
};
