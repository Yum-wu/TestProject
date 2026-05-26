import { Prism } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";

interface Props {
  language: string;
  code: string;
  showLineNumbers: boolean;
}

/** Thin wrapper around Prism syntax highlighter for lazy loading */
export default function SyntaxHighlighterWrapper({
  language,
  code,
  showLineNumbers,
}: Props) {
  return (
    <Prism
      language={language}
      style={oneDark}
      customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.8125rem" }}
      showLineNumbers={showLineNumbers}
    >
      {code}
    </Prism>
  );
}
