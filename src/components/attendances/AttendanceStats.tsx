'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Users, UserCheck, UserX, QrCode, Hand, Laptop } from 'lucide-react'

interface AttendanceStatsProps {
  stats: {
    total: number
    present: number
    absent: number
    percentage: number
    byMethod: {
      QR_CODE: number
      MANUAL: number
      AUTOMATIC: number
    }
  }
}

export function AttendanceStats({ stats }: AttendanceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Registrations */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total de Inscritos
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stats.total}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-ninma-purple/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-ninma-purple" aria-hidden="true" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Present */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Presentes
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.present}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.percentage}% do total
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Absent */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ausentes
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.absent}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {100 - stats.percentage}% do total
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <UserX className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Rate */}
      <Card>
        <CardContent className="pt-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Taxa de Presença
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-semibold text-foreground">
                  {stats.percentage}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-ninma-purple h-full transition-all duration-500 ease-out"
                  style={{ width: `${stats.percentage}%` }}
                  role="progressbar"
                  aria-valuenow={stats.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Taxa de presença"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Methods Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Métodos de Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* QR Code */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-ninma-teal/10 flex items-center justify-center flex-shrink-0">
                <QrCode className="h-5 w-5 text-ninma-teal" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">QR Code</p>
                  <Badge variant="teal-outline" size="sm">
                    {stats.byMethod.QR_CODE}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.present > 0
                    ? Math.round((stats.byMethod.QR_CODE / stats.present) * 100)
                    : 0}
                  % dos check-ins
                </p>
              </div>
            </div>

            {/* Manual */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-ninma-orange/10 flex items-center justify-center flex-shrink-0">
                <Hand className="h-5 w-5 text-ninma-orange" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Manual</p>
                  <Badge variant="orange-outline" size="sm">
                    {stats.byMethod.MANUAL}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.present > 0
                    ? Math.round((stats.byMethod.MANUAL / stats.present) * 100)
                    : 0}
                  % dos check-ins
                </p>
              </div>
            </div>

            {/* Automatic */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-ninma-purple/10 flex items-center justify-center flex-shrink-0">
                <Laptop className="h-5 w-5 text-ninma-purple" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Automático</p>
                  <Badge variant="purple-outline" size="sm">
                    {stats.byMethod.AUTOMATIC}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.present > 0
                    ? Math.round((stats.byMethod.AUTOMATIC / stats.present) * 100)
                    : 0}
                  % dos check-ins
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
