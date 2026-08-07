import { AdminLinkDetails } from '@/components/admin-link-details';

export default function AdminLinkDetailsPage({ params }: { params: { id: string } }) {
  return <AdminLinkDetails linkId={params.id} />;
}
