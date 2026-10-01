import "./ErrorMessage.css";

type ErrorMessageProps = {
  message: string;
};

function ErrorMessage({ message }: ErrorMessageProps) {
  return <p className="error-message">{message}</p>;
}

export default ErrorMessage;
