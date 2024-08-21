'use client';

import { Alert, Button } from '@mantine/core';
import { PDFDownloadLink, Document, Font, Page, Text, View, StyleSheet, Svg, Circle } from '@react-pdf/renderer';
import { ministryKeyToName } from '@/helpers/product';
import { formatFullName } from '@/helpers/user';
import { formatDate } from '@/utils/date';
import { Product } from './types';

Font.register({
  family: 'BCSans',
  fonts: [
    {
      src: '/fonts/bcsans-regular.woff',
      fontStyle: 'normal',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/bcsans-italic.woff',
      fontStyle: 'italic',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/bcsans-bold.woff',
      fontStyle: 'normal',
      fontWeight: 'bold',
    },
    {
      src: '/fonts/bcsans-bold-italic.woff',
      fontStyle: 'italic',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontSize: '10pt',
    paddingVertical: '10pt',
    paddingHorizontal: '20pt',
    fontFamily: 'BCSans',
  },
  section: {
    paddingLeft: '5pt',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '20pt',
    marginHorizontal: 'auto',
    marginTop: '10pt',
    marginBottom: '10pt',
  },
  h1: {
    fontWeight: 'semibold',
    fontSize: '15pt',
    marginBottom: '2pt',
  },
  label: {
    fontWeight: 'normal',
    fontSize: '13pt',
  },
  value: {
    fontWeight: 'normal',
    fontSize: '13pt',
    color: 'gray',
  },
  br: {
    marginVertical: '5pt',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  tableCol: {
    flex: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: '5pt',
    fontSize: '13pt',
  },
  tableHeader: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '14pt',
  },
});

function BillingDocument({ product }: { product: Product }) {
  return (
    <Document title="Electronic Memorandum of Understanding (eMOU)">
      <Page size="LETTER" orientation="portrait" wrap style={styles.page}>
        <View>
          <Text style={styles.title}>Electronic Memorandum of Understanding (eMOU)</Text>
        </View>
        <Text style={styles.h1}>Product Description</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Product Name</Text>
          <Text style={styles.value}>{product.name}</Text>
          <View style={styles.br} />
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{product.description}</Text>
          <View style={styles.br} />
          <Text style={styles.label}>Ministry</Text>
          <Text style={styles.value}>{ministryKeyToName(product.ministry)}</Text>
          <View style={styles.br} />
          <Text style={styles.label}>Cloud Service Provider</Text>
          <Text style={styles.value}>{product.provider}</Text>
        </View>

        <View style={styles.br} />

        <Text style={styles.h1}>Agreement</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol]}>
              <Text style={styles.tableCell}>Account Coding</Text>
            </View>
            <View style={[styles.tableCol]}>
              <Text style={styles.tableCell}>{product.billing.accountCoding}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol]}>
              <Text style={styles.tableCell}>Signed By</Text>
            </View>
            <View style={[styles.tableCol]}>
              <Text style={styles.tableCell}>{formatFullName(product.billing.signedBy)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol]}>
              <Text style={styles.tableCell}>Signed At</Text>
            </View>
            <View style={[styles.tableCol]}>
              <Text style={styles.tableCell}>{formatDate(product.billing.signedAt)}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default function BillingDownloadButton({ product }: { product: Product }) {
  return (
    <PDFDownloadLink document={<BillingDocument product={product} />}>
      {({ blob, url, loading, error }) => (
        <Button loading={loading} color="primary" size="xs" className="mt-2">
          Download
        </Button>
      )}
    </PDFDownloadLink>
  );
}
