'use client';
import { useParams } from 'next/navigation';
import React from 'react';

export default function AIUsagePage() {
  const params = useParams();
  const licencePlate = params?.licencePlate as string;

  const workspaceId = '504fc8bb-87db-4d59-b170-ee7d168e3d27';
  const reportId = '15c3c401-8c88-4ed5-8c86-d932528bb39f';

  const teamGitHubUsernames = ['kolezhanchik', 'artem-kravchenko'];

  const formattedUsernames = teamGitHubUsernames.map((username) => `'${username}'`).join(',');

  const filterString = `ai_credit_usage/username in (${formattedUsernames})`;

  const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${workspaceId}&autoAuth=true&filter=${filterString}`;

  return (
    <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#003366', margin: 0 }}>Team AI Usage Metrics</h2>
        <p style={{ color: '#4b5563', marginTop: '8px' }}>
          Showing telemetry for team on project: <strong style={{ color: '#000' }}>{licencePlate}</strong>
        </p>
      </div>
      {/* Fallback link just in case */}
      <div style={{ marginBottom: '24px' }}>
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#1a56db', textDecoration: 'underline' }}
        >
          Open full dashboard
        </a>
      </div>
      <div
        style={{
          aspectRatio: '16/9',
          width: '100%',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <iframe
          title="Team Centric AI Usage Report"
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          allowFullScreen
        />
      </div>
    </div>
  );
}
