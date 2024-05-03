function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

export async function generateUserImage(email: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // size: number, backgroundColor: string, textColor: string
    const size = 240;

    const initials = email
      .split('@')[0] // Extract the part before '@' as initials
      .split('.')
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join('');

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const text = initials;

    if (!context) {
      reject('Canvas not supported');
      return;
    }

    canvas.width = size;
    canvas.height = size;
    context.fillStyle = stringToColor(email.split('@')[0]);
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `${size / 2}px Sans-serif`;
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        resolve(imageUrl);
      } else {
        reject('User image generation failed');
      }
    }, 'image/jpeg');
  });
}

export async function getUserImage(email?: string, image?: string) {
  if (image) return image;
  if (!email) return '';

  try {
    const imageUrl = await generateUserImage(email);
    return imageUrl;
  } catch {
    return '';
  }
}
