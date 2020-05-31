<script>
    import Icons from "@global-modules/SvgIcons.js";

    export default {
        props: ['iconId'],
        render(createElement){
            return createElement('span');
        },
        mounted(){
            this.$el.outerHTML = Icons(this.iconId);
        }
    }
</script>