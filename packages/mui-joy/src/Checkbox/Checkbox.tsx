import * as React from 'react';
import PropTypes from 'prop-types';
import { OverridableComponent } from '@mui/types';
import { unstable_useId as useId, unstable_capitalize as capitalize } from '@mui/utils';
import { unstable_composeClasses as composeClasses } from '@mui/base';
import { useSwitch } from '@mui/base/SwitchUnstyled';
import { styled, useThemeProps } from '../styles';
import { useColorInversion } from '../styles/ColorInversion';
import useSlot from '../utils/useSlot';
import checkboxClasses, { getCheckboxUtilityClass } from './checkboxClasses';
import { CheckboxOwnerState, CheckboxTypeMap } from './CheckboxProps';
import CheckIcon from '../internal/svg-icons/Check';
import IndeterminateIcon from '../internal/svg-icons/HorizontalRule';
import { TypographyNestedContext } from '../Typography/Typography';
import FormControlContext from '../FormControl/FormControlContext';

const useUtilityClasses = (ownerState: CheckboxOwnerState) => {
  const { checked, disabled, disableIcon, focusVisible, color, variant, size } = ownerState;

  const slots = {
    root: [
      'root',
      checked && 'checked',
      disabled && 'disabled',
      focusVisible && 'focusVisible',
      variant && `variant${capitalize(variant)}`,
      color && `color${capitalize(color)}`,
      size && `size${capitalize(size)}`,
    ],
    checkbox: ['checkbox', checked && 'checked', disabled && 'disabled'], // disabled class is necessary for displaying global variant
    action: [
      'action',
      checked && 'checked',
      disableIcon && disabled && 'disabled', // add disabled class to action element for displaying global variant
      focusVisible && 'focusVisible',
    ],
    input: ['input'],
    label: ['label'],
  };

  return composeClasses(slots, getCheckboxUtilityClass, {});
};

const CheckboxRoot = styled('span', {
  name: 'JoyCheckbox',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<{ ownerState: CheckboxOwnerState }>(({ ownerState, theme }) => ({
  '--Icon-fontSize': 'var(--Checkbox-size)',
  ...(ownerState.size === 'sm' && {
    '--Checkbox-size': '1rem',
    '--Checkbox-gap': '0.375rem',
    '& ~ *': { '--FormHelperText-margin': '0.375rem 0 0 1.375rem' },
    fontSize: theme.vars.fontSize.sm,
  }),
  ...(ownerState.size === 'md' && {
    '--Checkbox-size': '1.25rem',
    '--Checkbox-gap': '0.5rem',
    '& ~ *': { '--FormHelperText-margin': '0.375rem 0 0 1.75rem' },
    fontSize: theme.vars.fontSize.md,
  }),
  ...(ownerState.size === 'lg' && {
    '--Checkbox-size': '1.5rem',
    '--Checkbox-gap': '0.625rem',
    '& ~ *': { '--FormHelperText-margin': '0.375rem 0 0 2.125rem' },
    fontSize: theme.vars.fontSize.lg,
  }),
  position: ownerState.overlay ? 'initial' : 'relative',
  display: 'inline-flex',
  fontFamily: theme.vars.fontFamily.body,
  lineHeight: 'var(--Checkbox-size)',
  color: theme.vars.palette.text.primary,
  [`&.${checkboxClasses.disabled}`]: {
    color: theme.variants.plainDisabled?.[ownerState.color!]?.color,
  },
  ...(ownerState.disableIcon && {
    color: theme.variants[ownerState.variant!]?.[ownerState.color!]?.color,
    [`&.${checkboxClasses.disabled}`]: {
      color: theme.variants[`${ownerState.variant!}Disabled`]?.[ownerState.color!]?.color,
    },
  }),
}));

const CheckboxCheckbox = styled('span', {
  name: 'JoyCheckbox',
  slot: 'Checkbox',
  overridesResolver: (props, styles) => styles.checkbox,
})<{ ownerState: CheckboxOwnerState }>(({ theme, ownerState }) => {
  const variantStyle = theme.variants[`${ownerState.variant!}`]?.[ownerState.color!];
  return [
    {
      boxSizing: 'border-box',
      borderRadius: theme.vars.radius.xs,
      width: 'var(--Checkbox-size)',
      height: 'var(--Checkbox-size)',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
      ...(ownerState.disableIcon && {
        display: 'contents',
      }),
    },
    ...(!ownerState.disableIcon
      ? [
          {
            ...variantStyle,
            backgroundColor: variantStyle?.backgroundColor ?? theme.vars.palette.background.surface,
          },
          { '&:hover': theme.variants[`${ownerState.variant!}Hover`]?.[ownerState.color!] },
          { '&:active': theme.variants[`${ownerState.variant!}Active`]?.[ownerState.color!] },
          {
            [`&.${checkboxClasses.disabled}`]:
              theme.variants[`${ownerState.variant!}Disabled`]?.[ownerState.color!],
          },
        ]
      : []),
  ];
});

const CheckboxAction = styled('span', {
  name: 'JoyCheckbox',
  slot: 'Action',
  overridesResolver: (props, styles) => styles.action,
})<{ ownerState: CheckboxOwnerState }>(({ theme, ownerState }) => [
  {
    borderRadius: `var(--Checkbox-action-radius, ${
      ownerState.overlay ? 'var(--internal-action-radius, inherit)' : 'inherit'
    })`,
    textAlign: 'left', // prevent text-align inheritance
    position: 'absolute',
    top: 'calc(-1 * var(--variant-borderWidth, 0px))', // clickable on the border and focus outline does not move when checked/unchecked
    left: 'calc(-1 * var(--variant-borderWidth, 0px))',
    bottom: 'calc(-1 * var(--variant-borderWidth, 0px))',
    right: 'calc(-1 * var(--variant-borderWidth, 0px))',
    zIndex: 1, // The action element usually cover the area of nearest positioned parent
    [theme.focus.selector]: theme.focus.default,
  },
  ...(ownerState.disableIcon
    ? [
        theme.variants[ownerState.variant!]?.[ownerState.color!],
        { '&:hover': theme.variants[`${ownerState.variant!}Hover`]?.[ownerState.color!] },
        { '&:active': theme.variants[`${ownerState.variant!}Active`]?.[ownerState.color!] },
        {
          [`&.${checkboxClasses.disabled}`]:
            theme.variants[`${ownerState.variant!}Disabled`]?.[ownerState.color!],
        },
      ]
    : []),
]);

const CheckboxInput = styled('input', {
  name: 'JoyCheckbox',
  slot: 'Input',
  overridesResolver: (props, styles) => styles.input,
})<{ ownerState: CheckboxOwnerState }>(() => ({
  margin: 0,
  opacity: 0,
  position: 'absolute',
  width: '100%',
  height: '100%',
  cursor: 'pointer',
}));

const CheckboxLabel = styled('label', {
  name: 'JoyCheckbox',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.label,
})<{ ownerState: CheckboxOwnerState }>(({ ownerState }) => ({
  flex: 1,
  minWidth: 0,
  ...(ownerState.disableIcon
    ? {
        zIndex: 1, // label should stay on top of the action.
        pointerEvents: 'none', // makes hover ineffect.
      }
    : {
        marginInlineStart: 'var(--Checkbox-gap)',
      }),
}));

const defaultCheckedIcon = <CheckIcon />;
const defaultIndeterminateIcon = <IndeterminateIcon />;

const Checkbox = React.forwardRef(function Checkbox(inProps, ref) {
  const props = useThemeProps<typeof inProps & { component?: React.ElementType }>({
    props: inProps,
    name: 'JoyCheckbox',
  });

  const {
    checked: checkedProp,
    uncheckedIcon,
    checkedIcon = defaultCheckedIcon,
    label,
    defaultChecked,
    disabled: disabledExternalProp,
    disableIcon = false,
    overlay,
    id: idOverride,
    indeterminate = false,
    indeterminateIcon = defaultIndeterminateIcon,
    name,
    onBlur,
    onChange,
    onFocus,
    onFocusVisible,
    readOnly,
    required,
    value,
    color: colorProp,
    variant: variantProp,
    size: sizeProp = 'md',
    ...other
  } = props;

  const formControl = React.useContext(FormControlContext);
  const disabledProp = inProps.disabled ?? formControl?.disabled ?? disabledExternalProp;
  const size = inProps.size ?? formControl?.size ?? sizeProp;

  if (process.env.NODE_ENV !== 'production') {
    const registerEffect = formControl?.registerEffect;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (registerEffect) {
        return registerEffect();
      }

      return undefined;
    }, [registerEffect]);
  }

  const id = useId(idOverride ?? formControl?.htmlFor);

  const useCheckboxProps = {
    checked: checkedProp,
    defaultChecked,
    disabled: disabledProp,
    onBlur,
    onChange,
    onFocus,
    onFocusVisible,
  };

  const { getInputProps, checked, disabled, focusVisible } = useSwitch(useCheckboxProps);

  const isCheckboxActive = checked || indeterminate;
  const activeVariant = variantProp || 'solid';
  const inactiveVariant = variantProp || 'outlined';
  const variant = isCheckboxActive ? activeVariant : inactiveVariant;
  const { getColor } = useColorInversion(variant);
  const color = getColor(
    inProps.color,
    formControl?.error ? 'danger' : formControl?.color ?? colorProp,
  );

  const activeColor = color || 'primary';
  const inactiveColor = color || 'neutral';

  const ownerState = {
    ...props,
    checked,
    disabled,
    disableIcon,
    overlay,
    focusVisible,
    color: isCheckboxActive ? activeColor : inactiveColor,
    variant,
    size,
  };

  const classes = useUtilityClasses(ownerState);

  const [SlotRoot, rootProps] = useSlot('root', {
    ref,
    className: classes.root,
    elementType: CheckboxRoot,
    externalForwardedProps: other,
    ownerState,
  });

  const [SlotCheckbox, checkboxProps] = useSlot('checkbox', {
    className: classes.checkbox,
    elementType: CheckboxCheckbox,
    externalForwardedProps: other,
    ownerState,
  });

  const [SlotAction, actionProps] = useSlot('action', {
    className: classes.action,
    elementType: CheckboxAction,
    externalForwardedProps: other,
    ownerState,
  });

  const [SlotInput, inputProps] = useSlot('input', {
    additionalProps: {
      id,
      name,
      value,
      readOnly,
      required: required ?? formControl?.required,
      'aria-describedby': formControl?.['aria-describedby'],
      ...(indeterminate && {
        // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-checked#values
        'aria-checked': 'mixed' as const,
      }),
    },
    className: classes.input,
    elementType: CheckboxInput,
    externalForwardedProps: other,
    getSlotProps: getInputProps,
    ownerState,
  });

  const [SlotLabel, labelProps] = useSlot('label', {
    additionalProps: {
      htmlFor: id,
    },
    className: classes.label,
    elementType: CheckboxLabel,
    externalForwardedProps: other,
    ownerState,
  });

  let icon = uncheckedIcon;

  if (disableIcon) {
    icon = null;
  } else if (indeterminate) {
    icon = indeterminateIcon;
  } else if (checked) {
    icon = checkedIcon;
  }

  return (
    <SlotRoot {...rootProps}>
      <SlotCheckbox {...checkboxProps}>
        <SlotAction {...actionProps}>
          <SlotInput {...inputProps} />
        </SlotAction>
        {icon}
      </SlotCheckbox>
      {label && (
        <TypographyNestedContext.Provider value>
          <SlotLabel {...labelProps}>{label}</SlotLabel>
        </TypographyNestedContext.Provider>
      )}
    </SlotRoot>
  );
}) as OverridableComponent<CheckboxTypeMap>;

Checkbox.propTypes /* remove-proptypes */ = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * If `true`, the component is checked.
   */
  checked: PropTypes.bool,
  /**
   * The icon to display when the component is checked.
   * @default <CheckIcon />
   */
  checkedIcon: PropTypes.node,
  /**
   * @ignore
   */
  children: PropTypes.node,
  /**
   * Class name applied to the root element.
   */
  className: PropTypes.string,
  /**
   * The color of the component. It supports those theme colors that make sense for this component.
   * @default 'neutral'
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['danger', 'info', 'primary', 'success', 'warning']),
    PropTypes.string,
  ]),
  /**
   * The default checked state. Use when the component is not controlled.
   */
  defaultChecked: PropTypes.bool,
  /**
   * If `true`, the component is disabled.
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, the checked icon is removed and the selected variant is applied on the `action` element instead.
   * @default false
   */
  disableIcon: PropTypes.bool,
  /**
   * @ignore
   */
  id: PropTypes.string,
  /**
   * If `true`, the component appears indeterminate.
   * This does not set the native input element to indeterminate due
   * to inconsistent behavior across browsers.
   * However, we set a `data-indeterminate` attribute on the `input`.
   * @default false
   */
  indeterminate: PropTypes.bool,
  /**
   * The icon to display when the component is indeterminate.
   * @default <IndeterminateCheckBoxIcon />
   */
  indeterminateIcon: PropTypes.node,
  /**
   * The label element next to the checkbox.
   */
  label: PropTypes.node,
  /**
   * The `name` attribute of the input.
   */
  name: PropTypes.string,
  /**
   * @ignore
   */
  onBlur: PropTypes.func,
  /**
   * Callback fired when the state is changed.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event The event source of the callback.
   * You can pull out the new value by accessing `event.target.value` (string).
   * You can pull out the new checked state by accessing `event.target.checked` (boolean).
   */
  onChange: PropTypes.func,
  /**
   * @ignore
   */
  onFocus: PropTypes.func,
  /**
   * @ignore
   */
  onFocusVisible: PropTypes.func,
  /**
   * If `true`, the root element's position is set to initial which allows the action area to fill the nearest positioned parent.
   * This prop is useful for composing Checkbox with ListItem component.
   * @default false
   */
  overlay: PropTypes.bool,
  /**
   * If `true`, the component is read only.
   */
  readOnly: PropTypes.bool,
  /**
   * If `true`, the `input` element is required.
   */
  required: PropTypes.bool,
  /**
   * The size of the component.
   * @default 'md'
   */
  size: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['sm', 'md', 'lg']),
    PropTypes.string,
  ]),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The icon when `checked` is false.
   */
  uncheckedIcon: PropTypes.node,
  /**
   * The value of the component. The DOM API casts this to a string.
   * The browser uses "on" as the default value.
   */
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.number,
    PropTypes.string,
  ]),
  /**
   * The variant to use.
   * @default 'solid'
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['outlined', 'plain', 'soft', 'solid']),
    PropTypes.string,
  ]),
} as any;

export default Checkbox;
