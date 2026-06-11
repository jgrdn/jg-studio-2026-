import type { ReactNode } from 'react'
import {
  WORK_COLUMNS,
  WORK_RATIOS,
  WORK_TYPES,
  columnsLabel,
  ratioLabel,
  workTypeLabel,
  type WorkColumns,
  type WorkRatio,
  type WorkType,
} from '../content/workFilters'
import {
  IconClear,
  IconFilter,
  IconGrid2,
  IconGrid3,
  IconGrid4,
  IconRatio11,
  IconRatio45,
  IconRatio54,
} from './WorkControlIcons'

type Props = {
  visible: boolean
  columns: WorkColumns
  ratio: WorkRatio
  workTypes: WorkType[]
  filtersOpen: boolean
  onFiltersOpenChange: (open: boolean) => void
  onColumnsChange: (cols: WorkColumns) => void
  onRatioChange: (ratio: WorkRatio) => void
  onWorkTypesChange: (types: WorkType[]) => void
}

function toggleItem<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

const GRID_ICONS = {
  2: IconGrid2,
  3: IconGrid3,
  4: IconGrid4,
} as const

const RATIO_ICONS = {
  '4-5': IconRatio45,
  '5-4': IconRatio54,
  '1-1': IconRatio11,
} as const

function IconBtn({
  pressed,
  label,
  onClick,
  children,
}: {
  pressed?: boolean
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={pressed ? 'work-icon-btn is-active' : 'work-icon-btn'}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      data-cursor-variant="spot"
    >
      {children}
    </button>
  )
}

export function WorkControls({
  visible,
  columns,
  ratio,
  workTypes,
  filtersOpen,
  onFiltersOpenChange,
  onColumnsChange,
  onRatioChange,
  onWorkTypesChange,
}: Props) {
  const hasFilters = workTypes.length > 0

  return (
    <div
      className={
        visible ? 'work-controls work-controls--visible' : 'work-controls'
      }
      aria-hidden={!visible}
    >
      <div className="work-controls__toolbar" role="toolbar" aria-label="Project grid layout">
        <div className="work-controls__group">
          {WORK_COLUMNS.map((cols) => {
            const Icon = GRID_ICONS[cols]
            return (
              <IconBtn
                key={cols}
                pressed={columns === cols}
                label={columnsLabel(cols)}
                onClick={() => onColumnsChange(cols)}
              >
                <Icon />
              </IconBtn>
            )
          })}
        </div>

        <span className="work-controls__divider" aria-hidden />

        <div className="work-controls__group">
          {WORK_RATIOS.map((r) => {
            const Icon = RATIO_ICONS[r]
            return (
              <IconBtn
                key={r}
                pressed={ratio === r}
                label={`Card ratio ${ratioLabel(r)}`}
                onClick={() => onRatioChange(r)}
              >
                <Icon />
              </IconBtn>
            )
          })}
        </div>

        <span className="work-controls__divider" aria-hidden />

        <div className="work-controls__group">
          <IconBtn
            pressed={filtersOpen || hasFilters}
            label={filtersOpen ? 'Hide filters' : 'Filter by work type'}
            onClick={() => onFiltersOpenChange(!filtersOpen)}
          >
            <IconFilter />
          </IconBtn>
          {hasFilters ? (
            <IconBtn
              label="Clear filters"
              onClick={() => onWorkTypesChange([])}
            >
              <IconClear />
            </IconBtn>
          ) : null}
        </div>
      </div>

      {filtersOpen ? (
        <div
          className="work-controls__filter-panel"
          role="toolbar"
          aria-label="Filter by work type"
        >
          {WORK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={
                workTypes.includes(type)
                  ? 'work-filter-chip is-active'
                  : 'work-filter-chip'
              }
              aria-pressed={workTypes.includes(type)}
              onClick={() => onWorkTypesChange(toggleItem(workTypes, type))}
              data-cursor-variant="spot"
            >
              {workTypeLabel(type)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
