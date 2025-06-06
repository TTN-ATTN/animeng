import { deleteToken, getToken } from "../../../db/queries";
import ResetForm from "../client/ResetForm";

interface ResetPasswordProps {
  searchParams: { token?: string };
}

export default async function ResetPage({ searchParams }: ResetPasswordProps) {
  const token = searchParams.token;

  if (!token) {
    return <InvalidToken />;
  }

  const user = await getToken(token);

  if (!user || !user.isValid) {
    await deleteToken(token);
    return <InvalidToken />;
  }

  return <ResetForm userId={user.identifier!} token={token} />;
}

function InvalidToken() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Invalid or expired token
        </h1>
      </div>
    </div>
  );
}
