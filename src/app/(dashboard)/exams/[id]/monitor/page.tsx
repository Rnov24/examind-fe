'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Bell,
  History,
  UserCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Check,
} from 'lucide-react'
import api from '@/lib/api'
import { wsBaseUrl } from '@/lib/ws'

interface StudentSession {
  session_id: number
  student_name: string
  student_identifier: string
  status: string
  integrity_score: number
  last_snapshot_url: string | null
  companion_snapshot_url?: string | null
  companion_paired?: boolean
  companion_metrics?: any
  last_event: string | null
  last_event_time: string | null
}

interface IncidentLog {
  id: number
  session_id: number
  event_type: string
  event_timestamp: string
  camera_source: string
  snapshot_url: string | null
  teacher_verdict: string
}

export default function LiveMonitoringPage() {
  const params = useParams()
  const examId = Number(params?.id) || 1

  const [filterMode, setFilterMode] = useState<'all' | 'flagged'>('all')
  const [studentsList, setStudentsList] = useState<StudentSession[]>([])
  const [activeWarningStudent, setActiveWarningStudent] = useState<StudentSession | null>(null)
  const [warningMessageText, setWarningMessageText] = useState('')
  const [selectedStudentLogs, setSelectedStudentLogs] = useState<StudentSession | null>(null)
  const [studentIncidentLogs, setStudentIncidentLogs] = useState<IncidentLog[]>([])

  // Human-in-the-Loop Proctoring State
  const [isProcessingAction, setIsProcessingAction] = useState(false)
  const [activeDisqualifyStudent, setActiveDisqualifyStudent] = useState<StudentSession | null>(null)
  const [disqualifyReason, setDisqualifyReason] = useState('Kerjasama / Menyontek Terang-terangan')
  const [disqualifyNotes, setDisqualifyNotes] = useState('')

  const wsRef = useRef<WebSocket | null>(null)

  const flaggedCount = useMemo(() => {
    return studentsList.filter((s) => s.integrity_score < 90 || s.status === 'aborted').length
  }, [studentsList])

  const filteredStudents = useMemo(() => {
    if (filterMode === 'flagged') {
      return studentsList.filter((s) => s.integrity_score < 90 || s.status === 'aborted')
    }
    return studentsList
  }, [studentsList, filterMode])

  function formatTimestamp(ts: string): string {
    if (!ts) return '-'
    return new Date(ts).toLocaleTimeString('id-ID')
  }

  function openWarningModal(student: StudentSession) {
    setActiveWarningStudent(student)
    setWarningMessageText('Harap kembali fokus ke layar ujian dan jangan menoleh.')
  }

  async function sendWarning() {
    if (!activeWarningStudent) return
    try {
      await api.post('/proctoring/send-warning', {
        session_id: activeWarningStudent.session_id,
        message_text: warningMessageText,
        urgency: 'high',
      })
      setActiveWarningStudent(null)
      setWarningMessageText('')
      alert('Peringatan telah terkirim!')
    } catch {
      alert('Gagal mengirim peringatan')
    }
  }

  async function openSnapshotModal(student: StudentSession) {
    setSelectedStudentLogs(student)
    try {
      const res = await api.get(`/proctoring/exam/${examId}/logs`)
      const allLogs = res.data.data || []
      setStudentIncidentLogs(allLogs.filter((l: IncidentLog) => l.session_id === student.session_id))
    } catch (err) {
      console.error('Failed to load student logs:', err)
    }
  }

  async function setVerdict(logId: number, verdict: string) {
    try {
      const res = await api.put(`/proctoring/log/${logId}/verdict`, { verdict })
      setStudentIncidentLogs((prev) =>
        prev.map((l) => (l.id === logId ? { ...l, teacher_verdict: verdict } : l))
      )
      const newScore = res.data.data?.new_integrity_score
      if (newScore !== undefined && selectedStudentLogs) {
        setSelectedStudentLogs((prev) => (prev ? { ...prev, integrity_score: newScore } : null))
        setStudentsList((prev) =>
          prev.map((s) =>
            s.session_id === selectedStudentLogs.session_id ? { ...s, integrity_score: newScore } : s
          )
        )
      }
    } catch {
      alert('Gagal memperbarui verdict')
    }
  }

  async function tolerateStudent(student: StudentSession) {
    if (!student) return
    try {
      setIsProcessingAction(true)
      const res = await api.post('/proctoring/session/tolerate', {
        session_id: student.session_id,
        notes: 'Toleransi wajar oleh pengawas (false positive / pergerakan wajar)',
      })
      const newScore = res.data.data?.new_integrity_score ?? 100

      setStudentsList((prev) =>
        prev.map((s) =>
          s.session_id === student.session_id
            ? { ...s, integrity_score: newScore, last_event: 'Ditoleransi Pengawas' }
            : s
        )
      )

      if (selectedStudentLogs && selectedStudentLogs.session_id === student.session_id) {
        setSelectedStudentLogs((prev) => (prev ? { ...prev, integrity_score: newScore } : null))
        setStudentIncidentLogs((prev) =>
          prev.map((l) =>
            l.teacher_verdict !== 'confirmed_violation'
              ? { ...l, teacher_verdict: 'ignored_false_positive' }
              : l
          )
        )
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memberikan toleransi')
    } finally {
      setIsProcessingAction(false)
    }
  }

  function openDisqualifyModal(student: StudentSession) {
    setActiveDisqualifyStudent(student)
    setDisqualifyReason('Kerjasama / Menyontek Terang-terangan')
    setDisqualifyNotes('')
  }

  async function confirmDisqualifyStudent() {
    if (!activeDisqualifyStudent) return
    try {
      setIsProcessingAction(true)
      await api.post('/proctoring/session/disqualify', {
        session_id: activeDisqualifyStudent.session_id,
        reason: disqualifyReason,
        notes: disqualifyNotes || 'Diskualifikasi resmi diputuskan oleh pengawas ujian.',
      })

      setStudentsList((prev) =>
        prev.map((s) =>
          s.session_id === activeDisqualifyStudent.session_id
            ? { ...s, status: 'aborted', integrity_score: 0, last_event: disqualifyReason }
            : s
        )
      )

      if (selectedStudentLogs && selectedStudentLogs.session_id === activeDisqualifyStudent.session_id) {
        setSelectedStudentLogs((prev) =>
          prev ? { ...prev, status: 'aborted', integrity_score: 0 } : null
        )
      }

      setActiveDisqualifyStudent(null)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menetapkan diskualifikasi')
    } finally {
      setIsProcessingAction(false)
    }
  }

  async function loadExamSessions() {
    try {
      const res = await api.get(`/grading/exam/${examId}/sessions`)
      const sessions = res.data.data || []
      setStudentsList(
        sessions.map((s: any) => ({
          session_id: s.session_id,
          student_name: s.student_name,
          student_identifier: s.student_identifier,
          status: s.status,
          integrity_score: s.status === 'aborted' ? 0 : (s.integrity_score ?? 100),
          last_snapshot_url: null,
          last_event: s.status === 'aborted' ? 'Didiskualifikasi Pengawas' : null,
          last_event_time: null,
        }))
      )
    } catch (err) {
      console.error('Failed to load exam sessions:', err)
    }
  }

  useEffect(() => {
    loadExamSessions()

    // Setup WebSocket
    let ws: WebSocket | null = null
    if (typeof window !== 'undefined') {
      const wsUrl = `${wsBaseUrl()}/ws/exam/${examId}/live-monitor`
      ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.event === 'PROCTORING_FLAG_ALERT' || msg.event === 'STUDENT_DISQUALIFIED') {
            const payload = msg.payload
            setStudentsList((prev) =>
              prev.map((s) => {
                if (s.session_id === payload.session_id) {
                  return {
                    ...s,
                    integrity_score: payload.current_integrity_score ?? s.integrity_score,
                    last_event: payload.event_type || payload.reason,
                    last_snapshot_url: payload.snapshot_url || s.last_snapshot_url,
                    status: payload.status || s.status,
                    last_event_time: new Date(payload.timestamp).toLocaleTimeString('id-ID'),
                  }
                }
                return s
              })
            )
          } else if (msg.event === 'COMPANION_FRAME_UPDATE') {
            const payload = msg.payload
            setStudentsList((prev) =>
              prev.map((s) => {
                if (s.session_id === payload.session_id) {
                  return {
                    ...s,
                    companion_snapshot_url: payload.snapshot_url,
                    companion_metrics: payload.metrics,
                    companion_paired: true,
                  }
                }
                return s
              })
            )
          } else if (msg.event === 'COMPANION_STATUS_CHANGE') {
            const payload = msg.payload
            setStudentsList((prev) =>
              prev.map((s) => {
                if (s.session_id === payload.session_id) {
                  return {
                    ...s,
                    companion_paired: payload.companion_paired,
                  }
                }
                return s
              })
            )
          }
        } catch (err) {
          console.warn('[LiveMonitorWS] Error parsing message:', err)
        }
      }
    }

    return () => {
      if (ws) ws.close()
    }
  }, [examId])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card">
        <div className="flex items-center gap-3.5">
          <Link
            href={`/exams/${examId}`}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Live Monitoring Pengawasan AI
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                LIVE PROCTOR
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pemantauan real-time dual-camera & deteksi anomali integritas siswa
            </p>
          </div>
        </div>

        {/* Quick Stats Filter */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer font-display tracking-wide ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-card'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
          >
            Semua Siswa ({studentsList.length})
          </button>
          <button
            onClick={() => setFilterMode('flagged')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer font-display tracking-wide ${
              filterMode === 'flagged'
                ? 'bg-amber-600 text-white shadow-card'
                : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 shadow-xs'
            }`}
          >
            Perlu Klarifikasi ({flaggedCount})
          </button>
        </div>
      </div>

      {/* Live Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.map((student) => {
          const borderClass =
            student.status === 'aborted' || student.integrity_score < 70
              ? 'border-rose-400 ring-2 ring-rose-200/80'
              : student.integrity_score < 90
              ? 'border-amber-400 ring-2 ring-amber-200/80'
              : 'border-slate-200/80'

          return (
            <div
              key={student.session_id}
              className={`bg-white rounded-2xl border transition-all duration-200 p-5 space-y-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 text-slate-900 ${borderClass}`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-display font-bold text-slate-900 text-sm leading-snug truncate">
                      {student.student_name}
                    </h4>
                    {student.status === 'aborted' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 tracking-wider font-mono flex items-center gap-1 shrink-0">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        Didiskualifikasi
                      </span>
                    ) : student.integrity_score < 90 ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 tracking-wider font-mono flex items-center gap-1 animate-pulse shrink-0">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Perlu Klarifikasi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wider font-mono flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Aman
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{student.student_identifier}</p>
                </div>

                {/* Integrity Score Pill */}
                <div
                  className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono shrink-0 shadow-xs tabular-nums ${
                    student.status === 'aborted'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : student.integrity_score >= 90
                      ? 'bg-[#c2ef4e]/20 text-slate-900 border border-[#c2ef4e]'
                      : student.integrity_score >= 70
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {student.status === 'aborted' ? '0%' : `${student.integrity_score}%`}
                </div>
              </div>

              {/* Latest Event Snapshot or Status (Dual-Camera Picture-in-Picture) */}
              <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video relative flex items-center justify-center border border-slate-200/80 shadow-inner group">
                {student.status === 'aborted' ? (
                  <div className="text-center p-4 bg-slate-950/95 w-full h-full flex flex-col items-center justify-center space-y-1.5">
                    <ShieldAlert className="w-7 h-7 text-rose-500" />
                    <span className="text-rose-400 font-bold text-xs uppercase tracking-wider font-mono">
                      Didiskualifikasi Pengawas
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 max-w-[90%] truncate">
                      {student.last_event
                        ? student.last_event.replace('_', ' ')
                        : 'Pelanggaran Dikonfirmasi Guru'}
                    </span>
                  </div>
                ) : student.last_snapshot_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={student.last_snapshot_url}
                    alt="Proctoring Snapshot"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <UserCheck className="w-8 h-8 text-slate-500 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-400 font-medium">Tidak ada anomali visual</span>
                  </div>
                )}

                {/* Secondary Camera (Companion) Picture-in-Picture Thumbnail */}
                {student.companion_snapshot_url ? (
                  <div
                    className="absolute top-2 right-2 w-20 h-14 rounded-lg overflow-hidden border-2 border-indigo-500 bg-black shadow-lg"
                    title="Cam 2 (Mobile Desk Cam)"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={student.companion_snapshot_url} className="w-full h-full object-cover" alt="Cam 2" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-[#c2ef4e] text-center font-bold font-mono">
                      Cam 2
                    </div>
                  </div>
                ) : (
                  <div
                    className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-semibold border backdrop-blur font-mono ${
                      student.companion_paired
                        ? 'bg-indigo-950/80 border-indigo-500/80 text-emerald-300'
                        : 'bg-black/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    {student.companion_paired ? 'Cam 2: OK' : 'Cam 2: Off'}
                  </div>
                )}

                {student.last_event && student.status !== 'aborted' && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/85 backdrop-blur-md rounded-lg p-1.5 px-2.5 flex items-center justify-between text-[11px] border border-white/10">
                    <span className="font-semibold text-rose-300 capitalize truncate mr-2">
                      {student.last_event.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono shrink-0">
                      {student.last_event_time}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openWarningModal(student)}
                    disabled={student.status === 'aborted'}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>Peringatkan</span>
                  </button>
                  <button
                    onClick={() => openSnapshotModal(student)}
                    className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <History className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Log Bukti</span>
                  </button>
                </div>

                {/* Human-in-the-Loop Proctoring Decision Bar */}
                {student.status !== 'aborted' && student.integrity_score < 90 ? (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => tolerateStudent(student)}
                      disabled={isProcessingAction}
                      title="Toleransi wajar sebagai false positive / pergerakan alami"
                      className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Toleransi</span>
                    </button>
                    <button
                      onClick={() => openDisqualifyModal(student)}
                      disabled={isProcessingAction}
                      title="Putuskan diskualifikasi resmi oleh pengawas"
                      className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Diskualifikasi</span>
                    </button>
                  </div>
                ) : student.status === 'aborted' ? (
                  <div className="pt-1.5 border-t border-slate-100 text-center">
                    <span className="text-[10px] text-rose-600 font-bold font-mono">
                      Sesi Gugur (Keputusan Pengawas)
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}

        {filteredStudents.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-16 text-center text-slate-500 border border-slate-200/80 shadow-card">
            Tidak ada data peserta ujian yang sesuai filter.
          </div>
        )}
      </div>

      {/* Send Warning Modal */}
      {activeWarningStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 text-slate-900">
            <h3 className="text-base font-bold text-slate-900">Kirim Peringatan Langsung</h3>
            <p className="text-xs text-slate-500">
              Pesan akan muncul seketika di layar ujian siswa{' '}
              <span className="font-bold text-slate-900">{activeWarningStudent.student_name}</span>.
            </p>

            <textarea
              value={warningMessageText}
              onChange={(e) => setWarningMessageText(e.target.value)}
              rows={3}
              placeholder="Contoh: Harap fokus dan pandangan tetap ke arah layar laptop..."
              className="w-full p-3.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-slate-900"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveWarningStudent(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs bg-white cursor-pointer shadow-xs"
              >
                Batal
              </button>
              <button
                onClick={sendWarning}
                disabled={!warningMessageText.trim()}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Kirim ke Layar Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log & Snapshot Detail Modal */}
      {selectedStudentLogs && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Riwayat Insiden Pengawasan</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedStudentLogs.student_name} ({selectedStudentLogs.student_identifier})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentLogs(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {studentIncidentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {log.snapshot_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={log.snapshot_url}
                        alt="Log Snapshot"
                        className="w-16 h-12 object-cover rounded-lg border border-slate-300"
                      />
                    )}
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 capitalize">
                        {log.event_type.replace('_', ' ')}
                      </span>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {formatTimestamp(log.event_timestamp)} • Kamera: {log.camera_source}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          log.teacher_verdict === 'confirmed_violation'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : log.teacher_verdict === 'ignored_false_positive'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {log.teacher_verdict === 'confirmed_violation'
                          ? 'Pelanggaran Dikonfirmasi'
                          : log.teacher_verdict === 'ignored_false_positive'
                          ? 'Diabaikan (False Positive)'
                          : 'Pending Review'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVerdict(log.id, 'ignored_false_positive')}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 cursor-pointer shadow-xs"
                    >
                      Abaikan
                    </button>
                    <button
                      onClick={() => setVerdict(log.id, 'confirmed_violation')}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 cursor-pointer"
                    >
                      Konfirmasi
                    </button>
                  </div>
                </div>
              ))}

              {studentIncidentLogs.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Belum ada insiden tercatat untuk siswa ini.
                </div>
              )}
            </div>

            {/* Footer Actions in Log Modal */}
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 font-medium">
                Prinsip Human-in-the-Loop: Evaluasi pengawas menentukan validitas pelanggaran.
              </div>
              <div className="flex items-center gap-2">
                {selectedStudentLogs && selectedStudentLogs.status !== 'aborted' && (
                  <>
                    <button
                      onClick={() => tolerateStudent(selectedStudentLogs)}
                      disabled={isProcessingAction}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Toleransi Semua Anomali</span>
                    </button>
                    <button
                      onClick={() => openDisqualifyModal(selectedStudentLogs)}
                      disabled={isProcessingAction}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Putuskan Diskualifikasi</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deliberate Disqualification Decision Modal (Human-in-the-Loop) */}
      {activeDisqualifyStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Putusan Diskualifikasi Ujian</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {activeDisqualifyStudent.student_name} ({activeDisqualifyStudent.student_identifier})
                </p>
              </div>
            </div>

            {/* Human-in-the-Loop Guarantee Notice */}
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Prinsip Human-in-the-Loop EXAMIND:
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Sistem AI tidak pernah menggugurkan peserta secara sepihak. Diskualifikasi ini adalah keputusan sadar
                dan resmi dari Bapak/Ibu pengawas. Sesi siswa akan dihentikan seketika dan catatan resmi Anda akan
                tersimpan di lembar evaluasi.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alasan Pelanggaran Resmi <span className="text-rose-600">*</span>
                </label>
                <select
                  value={disqualifyReason}
                  onChange={(e) => setDisqualifyReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:border-slate-900"
                >
                  <option value="Kerjasama / Menyontek Terang-terangan">
                    Kerjasama / Menyontek Terang-terangan (Orang lain / Gadget)
                  </option>
                  <option value="Joki Ujian / Pergantian Peserta">
                    Joki Ujian / Wajah Peserta Tidak Sesuai Terus Menerus
                  </option>
                  <option value="Meninggalkan Meja Ujian Tanpa Izin">
                    Meninggalkan Meja Ujian Tanpa Izin (Face Absent Berkepanjangan)
                  </option>
                  <option value="Mengabaikan Peringatan Pengawas Berkali-kali">
                    Mengabaikan Peringatan Pengawas Berkali-kali
                  </option>
                  <option value="Pelanggaran Integritas Akademik Berat Lainnya">
                    Pelanggaran Integritas Akademik Berat Lainnya
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Verifikasi Pengawas (Opsional)
                </label>
                <textarea
                  value={disqualifyNotes}
                  onChange={(e) => setDisqualifyNotes(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Terkonfirmasi membuka buku materi dan mengabaikan 2 kali peringatan pengawas pada menit 15 dan 22."
                  className="w-full p-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setActiveDisqualifyStudent(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs bg-white cursor-pointer shadow-xs"
              >
                Batalkan
              </button>
              <button
                onClick={confirmDisqualifyStudent}
                disabled={isProcessingAction || !disqualifyReason}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isProcessingAction ? 'Memproses...' : 'Tetapkan Diskualifikasi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
