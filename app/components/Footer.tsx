export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-6">
            <div className="container mx-auto flex flex-col items-center justify-center gap-4 text-center md:flex-row md:gap-8">
                <p className="text-sm text-balance leading-loose text-muted-foreground">
                    Built with <a href="https://remix.run" className="font-medium underline underline-offset-4">Remix</a>.
                </p>
            </div>
        </footer>
    );
}
