import { Img, Text } from '@react-email/components';

interface Styles {
  [key: string]: React.CSSProperties;
}

const containerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  borderBottom: '3px solid #FFA500',
  backgroundColor: '#003366',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
};

const imgStyles: React.CSSProperties = {
  margin: 'auto 8px',
};

const textContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  color: '#ffffff',
};

const textStyles: React.CSSProperties = {
  fontSize: '1.25rem',
  fontFamily: 'Roboto',
  fontWeight: 300,
};

const boldTextStyles: React.CSSProperties = {
  ...textStyles,
  fontWeight: 'normal',
};

export default function Header() {
  return (
    <div>
      <div style={containerStyles}>
        <Img
          src={`${process.env.BASE_URL}/logo.png`}
          alt="BC Platform Services Product Registry"
          width={58}
          height={41}
          style={imgStyles}
        />
        <div style={textContainerStyles}>
          <Text style={textStyles}>BC Platform Services</Text>
          <Text style={boldTextStyles}>Product Registry</Text>
        </div>
      </div>
    </div>
  );
}
