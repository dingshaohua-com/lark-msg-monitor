import React from 'react';
import { cn } from '../utils';

type CardPops = React.ComponentProps<'div'>;
export default function Card(props: CardPops) {
  return <div className={cn('border w-100 rounded p-2', props.className)}>{props.children}</div>;
}
