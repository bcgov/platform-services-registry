import Image from 'next/image';
import Logo from '../assets/logo.svg';
import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

export default function Header() {
  return (
    <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
      Join on <strong>Vercel</strong>
    </Heading>
  );
}
