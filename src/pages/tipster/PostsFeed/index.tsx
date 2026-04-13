import { TipsterLayout } from "@/layouts/TipsterLayout";
import { PostsFeedScreen } from "@/components/posts/PostsFeedScreen";

export default function PostsFeedPage() {
  return (
    <TipsterLayout isFixed={false}>
      <PostsFeedScreen />
    </TipsterLayout>
  );
}
