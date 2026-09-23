import { expect, type Page } from '@playwright/test'
import { findOffenderByCRN } from '../offender/find-offender'
import { getRowCellsByContent } from '../utils/table'

export type CheckAppointmentOnWorksheetSummaryOptions = {
    crn: string
    projectName: string
    hoursOffered: string
    hoursCredited: string
    contactOutcome: string
    appointmentsOffered: number
    appointmentsComplied: number
    appointmentsNotComplied: number
}

export default async function checkAppointmentOnWorksheetSummary(
    page: Page,
    {
        crn,
        projectName,
        hoursOffered,
        hoursCredited,
        contactOutcome,
        appointmentsOffered,
        appointmentsComplied,
        appointmentsNotComplied,
    }: CheckAppointmentOnWorksheetSummaryOptions
): Promise<void> {
    await findOffenderByCRN(page, crn)
    await page.locator('span.float-start:has-text("Case Summary")').waitFor()

    await page.getByRole('button', { name: 'Current Events' }).click()
    await page.getByRole('link', { name: 'view event' }).click()
    await page.locator('span.float-start:has-text("Event Details")').waitFor()

    await page.getByRole('link', { name: 'Unpaid Work' }).click()
    await page.locator('span.float-start:has-text("View UPW Details")').waitFor()

    await page.getByRole('button', { name: 'Worksheet Summary' }).click()
    await page.locator('span.float-start:has-text("UPW Worksheet Summary")').waitFor()

    const projectAppointmentCells = await getRowCellsByContent(page, 'appointmentsTable', projectName)
    expect(projectAppointmentCells[1]).toContain(projectName)
    expect(projectAppointmentCells[2]).toContain(hoursOffered)
    expect(projectAppointmentCells[3]).toContain(hoursCredited)
    expect(projectAppointmentCells[6]).toContain(contactOutcome)

    const attendanceTable = page.getByRole('table').nth(2)
    const valuesRow = attendanceTable.getByRole('row').nth(2)
    const attendanceValues = await valuesRow.getByRole('cell').allTextContents()

    expect(attendanceValues[0]).toContain(appointmentsOffered.toString())
    expect(attendanceValues[1]).toContain(appointmentsComplied.toString())
    expect(attendanceValues[2]).toContain(appointmentsNotComplied.toString())
}
