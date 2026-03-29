type Props = {
  text: string;
};

export function FieldHint({ text }: Props) {
  return (
    <span className="field-hint" tabIndex={0}>
      ?<span className="field-hint__bubble">{text}</span>
    </span>
  );
}
