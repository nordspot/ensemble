'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data-table';

interface Attendee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  ticket_type: string;
  status: string;
  payment_status: string;
  checked_in: boolean;
  registered_at: string;
}

interface AttendeeTableProps {
  congressId: string;
  locale: string;
}

const PAGE_SIZE = 20;

export function AttendeeTable({ congressId, locale }: AttendeeTableProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tReg = useTranslations('registration');

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchAttendees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (search) params.set('search', search);
      if (ticketFilter !== 'all') params.set('ticket_type', ticketFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(
        `/api/congress/${congressId}/attendees?${params.toString()}`
      );
      if (res.ok) {
        const json = await res.json();
        setAttendees(json.data ?? []);
        setTotal(json.meta?.total ?? 0);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [congressId, page, search, ticketFilter, statusFilter]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  // Debounced search
  useEffect(() => {
    setPage(1);
  }, [search, ticketFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function statusBadgeVariant(
    status: string
  ): 'success' | 'warning' | 'error' | 'secondary' {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  }

  function paymentBadgeVariant(
    status: string
  ): 'success' | 'warning' | 'error' | 'secondary' {
    switch (status) {
      case 'paid':
        return 'success';
      case 'unpaid':
        return 'warning';
      case 'refunded':
        return 'error';
      default:
        return 'secondary';
    }
  }

  function exportCsv() {
    const headers = [
      t('columns.name'),
      t('columns.email'),
      t('columns.ticketType'),
      t('columns.status'),
      t('columns.payment'),
      t('columns.checkin'),
    ];
    const rows = attendees.map((a) => [
      a.full_name,
      a.email,
      a.ticket_type,
      a.status,
      a.payment_status,
      a.checked_in ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${c}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendees-${congressId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const selected = selectedId
    ? attendees.find((a) => a.id === selectedId)
    : null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder={t('attendees.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={ticketFilter} onValueChange={setTicketFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('columns.ticketType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon('actions.filter')}: {t('columns.ticketType')}</SelectItem>
            <SelectItem value="early_bird">{tReg('ticketTypes.early_bird')}</SelectItem>
            <SelectItem value="standard">{tReg('ticketTypes.standard')}</SelectItem>
            <SelectItem value="vip">{tReg('ticketTypes.vip')}</SelectItem>
            <SelectItem value="virtual">{tReg('ticketTypes.virtual')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('columns.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon('actions.filter')}: {tCommon('labels.status')}</SelectItem>
            <SelectItem value="confirmed">{tCommon('status.confirmed')}</SelectItem>
            <SelectItem value="pending">{tCommon('status.pending')}</SelectItem>
            <SelectItem value="cancelled">{tCommon('status.cancelled')}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          {tCommon('actions.export')} CSV
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.name')}</TableHead>
                <TableHead>{t('columns.email')}</TableHead>
                <TableHead>{t('columns.ticketType')}</TableHead>
                <TableHead>{t('columns.status')}</TableHead>
                <TableHead>{t('columns.payment')}</TableHead>
                <TableHead>{t('columns.checkin')}</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-ensemble-500">
                    {t('attendees.loading')}
                  </TableCell>
                </TableRow>
              ) : attendees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-ensemble-500">
                    {t('attendees.noResults')}
                  </TableCell>
                </TableRow>
              ) : (
                attendees.map((attendee) => (
                  <TableRow
                    key={attendee.id}
                    className={cn(
                      'cursor-pointer',
                      selectedId === attendee.id && 'bg-ensemble-50 dark:bg-ensemble-800/70'
                    )}
                    onClick={() =>
                      setSelectedId(
                        selectedId === attendee.id ? null : attendee.id
                      )
                    }
                  >
                    <TableCell className="font-medium">
                      {attendee.full_name}
                    </TableCell>
                    <TableCell>{attendee.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {tReg(`ticketTypes.${attendee.ticket_type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(attendee.status)}>
                        {tCommon(`status.${attendee.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentBadgeVariant(attendee.payment_status)}>
                        {t(`payment.${attendee.payment_status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {attendee.checked_in ? (
                        <span className="flex items-center gap-1 text-success text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          {t('checkedIn')}
                        </span>
                      ) : (
                        <span className="text-sm text-ensemble-400">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="text-ensemble-400 hover:text-ensemble-600 dark:hover:text-ensemble-200"
                        aria-label={tCommon('actions.edit')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                          <circle cx="5" cy="12" r="1" />
                        </svg>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ensemble-500 dark:text-ensemble-400">
            {t('attendees.showing', {
              from: (page - 1) * PAGE_SIZE + 1,
              to: Math.min(page * PAGE_SIZE, total),
              total,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t('attendees.prev')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('attendees.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{selected.full_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-ensemble-500 dark:text-ensemble-400">
                  {t('columns.email')}
                </dt>
                <dd className="text-ensemble-900 dark:text-ensemble-50">{selected.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-ensemble-500 dark:text-ensemble-400">
                  {t('columns.ticketType')}
                </dt>
                <dd>{tReg(`ticketTypes.${selected.ticket_type}`)}</dd>
              </div>
              <div>
                <dt className="font-medium text-ensemble-500 dark:text-ensemble-400">
                  {t('columns.status')}
                </dt>
                <dd>
                  <Badge variant={statusBadgeVariant(selected.status)}>
                    {tCommon(`status.${selected.status}`)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ensemble-500 dark:text-ensemble-400">
                  {t('columns.payment')}
                </dt>
                <dd>
                  <Badge variant={paymentBadgeVariant(selected.payment_status)}>
                    {t(`payment.${selected.payment_status}`)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ensemble-500 dark:text-ensemble-400">
                  {t('attendees.registeredAt')}
                </dt>
                <dd>
                  {new Date(selected.registered_at).toLocaleDateString(locale)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ensemble-500 dark:text-ensemble-400">
                  {t('columns.checkin')}
                </dt>
                <dd>
                  {selected.checked_in ? t('checkedIn') : t('notCheckedIn')}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
