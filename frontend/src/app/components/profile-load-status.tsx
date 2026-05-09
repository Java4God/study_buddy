interface ProfileLoadStatusProps {
  loading: boolean;
  error: string | null;
}

export const ProfileLoadStatus = ({
  loading,
  error,
}: ProfileLoadStatusProps) => {
  return (
    <div className="space-y-6 p-8 px-20 flex-1 bg-switch-background/20">
      <div>
        <h1 className="text-3xl mb-2">Profile</h1>
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <p className="text-gray-600">
            {loading ? "Loading profile..." : "Profile not found."}
          </p>
        )}
      </div>
    </div>
  );
};
