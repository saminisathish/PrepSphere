import { useCallback } from 'react';
import { useDaily } from '@daily-co/daily-react';

export const useCVICall = (): {
  joinCall: (props: { url: string }) => Promise<void>;
  leaveCall: () => Promise<void>;
} => {
  const daily = useDaily();

  const joinCall = useCallback(
    async ({ url }: { url: string }) => {
      if (!daily) {
        console.error('Daily call object is not ready');
        return;
      }

      if (!url) {
        console.error('Tavus conversation URL is missing');
        return;
      }

      try {
        console.log('Joining Tavus conversation:', url);

        await daily.join({
          url,
          inputSettings: {
            audio: {
              processor: {
                type: 'none',
              },
            },
          },
        });

        console.log('Successfully joined Tavus conversation');
      } catch (error) {
        console.error('Failed to join Tavus conversation:', error);
      }
    },
    [daily]
  );

  const leaveCall = useCallback(async () => {
    if (!daily) return;

    try {
      await daily.leave();
      console.log('Left Tavus conversation');
    } catch (error) {
      console.error('Failed to leave Tavus conversation:', error);
    }
  }, [daily]);

  return {
    joinCall,
    leaveCall,
  };
};