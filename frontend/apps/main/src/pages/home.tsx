import { useState } from 'react';
import { syncReport } from '@/api/report';

const Home = () => {
  const [report, setReport] = useState<any>(null);
  const test = async () => {
    const res = await syncReport({
      start: '2026-02-01',
      end: '2026-03-04',
    });
    setReport(res.data)
  }

  
  return (
    <div className="content">
      <button onClick={test}>测试</button>
      <div>
        {report?.map((item: any) => (
          <div key={item.chat_id} className="border-b border-gray-200 p-2 mb-10">
            <div>{item.chat_id}</div>
            <div>{JSON.stringify(item.body)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
