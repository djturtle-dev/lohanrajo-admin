import { redirect } from 'next/navigation';

// Root of the admin app → always go to /admin
export default function Home() {
    redirect('/admin');
}
