<script lang="ts" module>
	import ITools from '@tabler/icons-svelte-runes/icons/tools';
	import ICrane from '@tabler/icons-svelte-runes/icons/crane';
	import IBuildingFactory from '@tabler/icons-svelte-runes/icons/building-factory';
	import IBuildingFactory2 from '@tabler/icons-svelte-runes/icons/building-factory-2';
	import IHelmet from '@tabler/icons-svelte-runes/icons/helmet';
	import IShieldCheck from '@tabler/icons-svelte-runes/icons/shield-check';
	import IRulerMeasure from '@tabler/icons-svelte-runes/icons/ruler-measure';
	import ITruck from '@tabler/icons-svelte-runes/icons/truck';
	import IBulldozer from '@tabler/icons-svelte-runes/icons/bulldozer';
	import IBarrierBlock from '@tabler/icons-svelte-runes/icons/barrier-block';
	import IBuilding from '@tabler/icons-svelte-runes/icons/building';
	import IBuildingBridge from '@tabler/icons-svelte-runes/icons/building-bridge';
	import IWall from '@tabler/icons-svelte-runes/icons/wall';
	import IHammer from '@tabler/icons-svelte-runes/icons/hammer';
	import ISettings from '@tabler/icons-svelte-runes/icons/settings';
	import IBolt from '@tabler/icons-svelte-runes/icons/bolt';
	import IAward from '@tabler/icons-svelte-runes/icons/award';
	import ICertificate from '@tabler/icons-svelte-runes/icons/certificate';
	import IUsers from '@tabler/icons-svelte-runes/icons/users';
	import IClock from '@tabler/icons-svelte-runes/icons/clock';
	import ICalendar from '@tabler/icons-svelte-runes/icons/calendar';
	import IMapPin from '@tabler/icons-svelte-runes/icons/map-pin';
	import IPhone from '@tabler/icons-svelte-runes/icons/phone';
	import IMail from '@tabler/icons-svelte-runes/icons/mail';
	import IBrandWhatsapp from '@tabler/icons-svelte-runes/icons/brand-whatsapp';
	import IBrandLinkedin from '@tabler/icons-svelte-runes/icons/brand-linkedin';
	import IBrandFacebook from '@tabler/icons-svelte-runes/icons/brand-facebook';
	import IBrandInstagram from '@tabler/icons-svelte-runes/icons/brand-instagram';
	import IBrandYoutube from '@tabler/icons-svelte-runes/icons/brand-youtube';
	import IArrowRight from '@tabler/icons-svelte-runes/icons/arrow-right';
	import IArrowUpRight from '@tabler/icons-svelte-runes/icons/arrow-up-right';
	import IArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
	import IChevronDown from '@tabler/icons-svelte-runes/icons/chevron-down';
	import IChevronLeft from '@tabler/icons-svelte-runes/icons/chevron-left';
	import IChevronRight from '@tabler/icons-svelte-runes/icons/chevron-right';
	import IX from '@tabler/icons-svelte-runes/icons/x';
	import IMenu2 from '@tabler/icons-svelte-runes/icons/menu-2';
	import ICheck from '@tabler/icons-svelte-runes/icons/check';
	import IAlertTriangle from '@tabler/icons-svelte-runes/icons/alert-triangle';
	import IAlertCircle from '@tabler/icons-svelte-runes/icons/alert-circle';
	import IInfoCircle from '@tabler/icons-svelte-runes/icons/info-circle';
	import ICircleCheck from '@tabler/icons-svelte-runes/icons/circle-check';
	import IDownload from '@tabler/icons-svelte-runes/icons/download';
	import IFileText from '@tabler/icons-svelte-runes/icons/file-text';
	import IFileTypePdf from '@tabler/icons-svelte-runes/icons/file-type-pdf';
	import ISearch from '@tabler/icons-svelte-runes/icons/search';
	import IPlus from '@tabler/icons-svelte-runes/icons/plus';
	import ITrash from '@tabler/icons-svelte-runes/icons/trash';
	import IEdit from '@tabler/icons-svelte-runes/icons/edit';
	import IEye from '@tabler/icons-svelte-runes/icons/eye';
	import IEyeOff from '@tabler/icons-svelte-runes/icons/eye-off';
	import IUpload from '@tabler/icons-svelte-runes/icons/upload';
	import IPhoto from '@tabler/icons-svelte-runes/icons/photo';
	import IHome from '@tabler/icons-svelte-runes/icons/home';
	import IBriefcase from '@tabler/icons-svelte-runes/icons/briefcase';
	import IMessage from '@tabler/icons-svelte-runes/icons/message';
	import IInbox from '@tabler/icons-svelte-runes/icons/inbox';
	import IUser from '@tabler/icons-svelte-runes/icons/user';
	import ILogout from '@tabler/icons-svelte-runes/icons/logout';
	import ILayoutDashboard from '@tabler/icons-svelte-runes/icons/layout-dashboard';
	import IFile from '@tabler/icons-svelte-runes/icons/file';
	import IList from '@tabler/icons-svelte-runes/icons/list';
	import IStar from '@tabler/icons-svelte-runes/icons/star';
	import ILeaf from '@tabler/icons-svelte-runes/icons/leaf';
	import IHeartHandshake from '@tabler/icons-svelte-runes/icons/heart-handshake';
	import ITarget from '@tabler/icons-svelte-runes/icons/target';
	import IFlag from '@tabler/icons-svelte-runes/icons/flag';
	import ITrendingUp from '@tabler/icons-svelte-runes/icons/trending-up';
	import IPackage from '@tabler/icons-svelte-runes/icons/package';
	import IEngine from '@tabler/icons-svelte-runes/icons/engine';
	import IForklift from '@tabler/icons-svelte-runes/icons/forklift';
	import IBackhoe from '@tabler/icons-svelte-runes/icons/backhoe';
	import ILadder from '@tabler/icons-svelte-runes/icons/ladder';
	import ICone from '@tabler/icons-svelte-runes/icons/cone';
	import IPlant from '@tabler/icons-svelte-runes/icons/plant';
	import IBuildingWarehouse from '@tabler/icons-svelte-runes/icons/building-warehouse';
	import ISettings2 from '@tabler/icons-svelte-runes/icons/settings-2';
	import IGripVertical from '@tabler/icons-svelte-runes/icons/grip-vertical';
	import IArrowUp from '@tabler/icons-svelte-runes/icons/arrow-up';
	import IArrowDown from '@tabler/icons-svelte-runes/icons/arrow-down';
	import IExternalLink from '@tabler/icons-svelte-runes/icons/external-link';
	import ILock from '@tabler/icons-svelte-runes/icons/lock';
	import IHistory from '@tabler/icons-svelte-runes/icons/history';
	import ICopy from '@tabler/icons-svelte-runes/icons/copy';
	import IQuote from '@tabler/icons-svelte-runes/icons/quote';
	import IZoomIn from '@tabler/icons-svelte-runes/icons/zoom-in';
	import IMap from '@tabler/icons-svelte-runes/icons/map';
	import IWorld from '@tabler/icons-svelte-runes/icons/world';
	import IReport from '@tabler/icons-svelte-runes/icons/report';
	import IScale from '@tabler/icons-svelte-runes/icons/scale';
	import IBox from '@tabler/icons-svelte-runes/icons/box';
	import ITruckDelivery from '@tabler/icons-svelte-runes/icons/truck-delivery';
	import IClipboardCheck from '@tabler/icons-svelte-runes/icons/clipboard-check';
	import IClipboardList from '@tabler/icons-svelte-runes/icons/clipboard-list';
	import IUsersGroup from '@tabler/icons-svelte-runes/icons/users-group';
	import IChartBar from '@tabler/icons-svelte-runes/icons/chart-bar';
	import ISpeakerphone from '@tabler/icons-svelte-runes/icons/speakerphone';
	import IHeart from '@tabler/icons-svelte-runes/icons/heart';
	import IDeviceFloppy from '@tabler/icons-svelte-runes/icons/device-floppy';
	import ILayoutGrid from '@tabler/icons-svelte-runes/icons/layout-grid';
	import IPaperclip from '@tabler/icons-svelte-runes/icons/paperclip';
	import IKey from '@tabler/icons-svelte-runes/icons/key';
	import INews from '@tabler/icons-svelte-runes/icons/news';
	import IHelpCircle from '@tabler/icons-svelte-runes/icons/help-circle';
	import IBuildingCommunity from '@tabler/icons-svelte-runes/icons/building-community';
	import IRoute from '@tabler/icons-svelte-runes/icons/route';
	import IRefresh from '@tabler/icons-svelte-runes/icons/refresh';
	import ICalculator from '@tabler/icons-svelte-runes/icons/calculator';
	import IFileCertificate from '@tabler/icons-svelte-runes/icons/file-certificate';
	import IIdBadge2 from '@tabler/icons-svelte-runes/icons/id-badge-2';

	/** Curated Tabler icon set (DESIGN-SYSTEM §8). Names are stored in the CMS for services, values and stats. */
	export const ICONS = {
		'tools': ITools,
		'crane': ICrane,
		'building-factory': IBuildingFactory,
		'building-factory-2': IBuildingFactory2,
		'helmet': IHelmet,
		'shield-check': IShieldCheck,
		'ruler-measure': IRulerMeasure,
		'truck': ITruck,
		'bulldozer': IBulldozer,
		'barrier-block': IBarrierBlock,
		'building': IBuilding,
		'building-bridge': IBuildingBridge,
		'wall': IWall,
		'hammer': IHammer,
		'settings': ISettings,
		'bolt': IBolt,
		'award': IAward,
		'certificate': ICertificate,
		'users': IUsers,
		'clock': IClock,
		'calendar': ICalendar,
		'map-pin': IMapPin,
		'phone': IPhone,
		'mail': IMail,
		'brand-whatsapp': IBrandWhatsapp,
		'brand-linkedin': IBrandLinkedin,
		'brand-facebook': IBrandFacebook,
		'brand-instagram': IBrandInstagram,
		'brand-youtube': IBrandYoutube,
		'arrow-right': IArrowRight,
		'arrow-up-right': IArrowUpRight,
		'arrow-left': IArrowLeft,
		'chevron-down': IChevronDown,
		'chevron-left': IChevronLeft,
		'chevron-right': IChevronRight,
		'x': IX,
		'menu-2': IMenu2,
		'check': ICheck,
		'alert-triangle': IAlertTriangle,
		'alert-circle': IAlertCircle,
		'info-circle': IInfoCircle,
		'circle-check': ICircleCheck,
		'download': IDownload,
		'file-text': IFileText,
		'file-type-pdf': IFileTypePdf,
		'search': ISearch,
		'plus': IPlus,
		'trash': ITrash,
		'edit': IEdit,
		'eye': IEye,
		'eye-off': IEyeOff,
		'upload': IUpload,
		'photo': IPhoto,
		'home': IHome,
		'briefcase': IBriefcase,
		'message': IMessage,
		'inbox': IInbox,
		'user': IUser,
		'logout': ILogout,
		'layout-dashboard': ILayoutDashboard,
		'file': IFile,
		'list': IList,
		'star': IStar,
		'leaf': ILeaf,
		'heart-handshake': IHeartHandshake,
		'target': ITarget,
		'flag': IFlag,
		'trending-up': ITrendingUp,
		'package': IPackage,
		'engine': IEngine,
		'forklift': IForklift,
		'backhoe': IBackhoe,
		'ladder': ILadder,
		'cone': ICone,
		'plant': IPlant,
		'building-warehouse': IBuildingWarehouse,
		'settings-2': ISettings2,
		'grip-vertical': IGripVertical,
		'arrow-up': IArrowUp,
		'arrow-down': IArrowDown,
		'external-link': IExternalLink,
		'lock': ILock,
		'history': IHistory,
		'copy': ICopy,
		'quote': IQuote,
		'zoom-in': IZoomIn,
		'map': IMap,
		'world': IWorld,
		'report': IReport,
		'scale': IScale,
		'box': IBox,
		'truck-delivery': ITruckDelivery,
		'clipboard-check': IClipboardCheck,
		'clipboard-list': IClipboardList,
		'users-group': IUsersGroup,
		'chart-bar': IChartBar,
		'speakerphone': ISpeakerphone,
		'heart': IHeart,
		'device-floppy': IDeviceFloppy,
		'layout-grid': ILayoutGrid,
		'paperclip': IPaperclip,
		'key': IKey,
		'news': INews,
		'help-circle': IHelpCircle,
		'building-community': IBuildingCommunity,
		'route': IRoute,
		'refresh': IRefresh,
		'calculator': ICalculator,
		'file-certificate': IFileCertificate,
		'id-badge-2': IIdBadge2,
	} as const;
	export type IconName = keyof typeof ICONS;
	export const ICON_NAMES = Object.keys(ICONS) as IconName[];
</script>

<script lang="ts">
	let {
		name,
		size = 20,
		stroke,
		label,
		class: className = ''
	}: { name: string | null | undefined; size?: number; stroke?: number; label?: string; class?: string } = $props();

	const Cmp = $derived(ICONS[(name ?? 'tools') as IconName] ?? ICONS.tools);
</script>

<Cmp
	{size}
	stroke={stroke ?? (size >= 32 ? 1.75 : 2)}
	class={className}
	aria-hidden={label ? undefined : 'true'}
	aria-label={label}
	role={label ? 'img' : undefined}
	focusable='false'
/>
