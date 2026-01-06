import { MainLayout } from '@/components/layout/MainLayout';
import { TransactionList } from '@/components/transactions/TransactionList';

const Transactions = () => {
  return (
    <MainLayout>
      <TransactionList />
    </MainLayout>
  );
};

export default Transactions;
