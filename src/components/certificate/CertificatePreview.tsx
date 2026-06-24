import {
  certificateText,
  formatCertificateDate,
  type CertificatePreviewData,
} from '@/utils/certificateTemplate';
import React, { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const CERTIFICATE_TEMPLATE = require('@/assets/images/certi.png');
export const CERTIFICATE_ASPECT_RATIO = 1402 / 1122;

type Props = CertificatePreviewData & {
  width?: number;
};

const CertificatePreview = forwardRef<View, Props>(function CertificatePreview(
  {
    pastorName,
    completionDate,
    certificateId,
    duration,
    width = 320,
  },
  ref,
) {
  const height = width / CERTIFICATE_ASPECT_RATIO;

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[styles.container, { width, height }]}
    >
      <Image
        source={CERTIFICATE_TEMPLATE}
        style={styles.templateImage}
        resizeMode="contain"
      />

      <Text
        style={[styles.pastorName, { fontSize: width * 0.034 }]}
        numberOfLines={1}
      >
        {certificateText(pastorName, 'Pastor')}
      </Text>

      <Text
        style={[styles.detail, styles.completionDate, { fontSize: width * 0.019 }]}
        numberOfLines={1}
      >
        {formatCertificateDate(completionDate)}
      </Text>

      <Text
        style={[styles.detail, styles.duration, { fontSize: width * 0.019 }]}
        numberOfLines={1}
      >
        {certificateText(duration, '12 Months')}
      </Text>

      <Text
        style={[styles.detail, styles.certificateId, { fontSize: width * 0.015 }]}
        numberOfLines={1}
      >
        {certificateText(certificateId)}
      </Text>

      <Text
        style={[styles.detail, styles.status, { fontSize: width * 0.019 }]}
        numberOfLines={1}
      >
        Completed
      </Text>
    </View>
  );
});

export default CertificatePreview;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  templateImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  pastorName: {
    position: 'absolute',
    left: '23%',
    right: '18%',
    top: '42.4%',
    textAlign: 'center',
    color: '#082d72',
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  detail: {
    position: 'absolute',
    top: '77.6%',
    textAlign: 'center',
    color: '#082d72',
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  completionDate: {
    left: '18.5%',
    width: '10%',
  },
  duration: {
    left: '32%',
    width: '10%',
  },
  certificateId: {
    left: '58%',
    width: '15%',
  },
  status: {
    left: '74%',
    width: '10%',
  },
});
