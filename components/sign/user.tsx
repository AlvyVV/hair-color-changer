'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useAppContext } from '@/contexts/app';
import { removeCookieValueSafely } from '@/lib/cookie';
import { User, UserCredits } from '@/types/user';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import Icon from '@/components/icon';

export default function SignUser({ user }: { user: User }) {
  const t = useTranslations();
  const router = useRouter();
  const { setUser } = useAppContext();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);

  // 获取用户积分数据
  const fetchUserCredits = async () => {
    if (creditsLoading) return;
    
    try {
      setCreditsLoading(true);
      const response = await api.post<{ data: UserCredits }>('/api/get-user-credits');
      setCredits(response.data);
    } catch (error) {
      console.error('获取积分失败:', error);
    } finally {
      setCreditsLoading(false);
    }
  };

  // 在弹框打开时获取积分数据
  const handleDropdownOpenChange = (open: boolean) => {
    if (open && !credits && !creditsLoading) {
      fetchUserCredits();
    }
  };

  // 真正的登出逻辑
  const handleSignOut = () => {
    console.log('[登出] 开始登出流程...');

    // 使用增强的 cookie 删除方法
    const userInfoDeleted = removeCookieValueSafely('user_info');
    const authTokenDeleted = removeCookieValueSafely('auth_token');

    console.log('[登出] Cookie 删除结果:', { userInfoDeleted, authTokenDeleted });

    if (!userInfoDeleted || !authTokenDeleted) {
      console.warn('[登出] 警告: 部分 Cookie 删除失败，但将继续登出流程');
    }

    // 更新用户状态
    setUser(null);

    // 重定向到首页
    router.push('/');

    console.log('[登出] 登出流程完成');
  };

  return (
    <DropdownMenu onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.avatarUrl} alt={user.nickname} />
          <AvatarFallback>{user.nickname}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-4 min-w-[180px]">
        <DropdownMenuLabel className="text-center truncate">{user.nickname}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* 积分显示区域 */}
        <div className="px-2 py-1 text-center text-sm text-muted-foreground">
          {creditsLoading ? (
            <span>Loading...</span>
          ) : credits ? (
            <div className="space-y-1">
              <div className="font-medium text-foreground flex items-center justify-center gap-1">
                <Icon name="RiCopperDiamondLine" className="size-4 shrink-0" />
                {credits.leftCredits || 0} credits
              </div>
              {credits.totalBalance !== undefined && (
                <div className="text-xs">
                  Total: {credits.totalBalance}
                </div>
              )}
            </div>
          ) : (
            <span>-</span>
          )}
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex justify-center cursor-pointer">
          <Link href="/my-credits">{t('my_credits.title')}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-center cursor-pointer">
          <Link href="/my-media-records" target="_blank">
            {t('my_media_records.title')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-center cursor-pointer" onClick={handleSignOut}>
          {t('user.sign_out')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
