/// <reference types="vite/client" />

import type React from "react";
import type { WebviewTag } from "electron";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<WebviewTag>, WebviewTag> & {
        src?: string;
        partition?: string;
        allowpopups?: boolean;
      };
    }
  }
}
